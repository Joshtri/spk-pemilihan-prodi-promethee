import prisma from "../prisma";
import { evaluateCriteriaMapping } from "./evaluateCriteriaMapping";

interface MappingResult {
    programStudiId: string;
    kriteriaId: string;
    subKriteriaId: string;
    nilai: number;
    bobot?: number;
    criteriaName?: string;
}

export async function runPrometheePreview(userId: string, programStudiIds: string[], includeDetails = false) {
    // Validate input
    if (!programStudiIds || programStudiIds.length < 1) {
        throw new Error("At least one program studi is required");
    }

    // If only one program, return a default result
    if (programStudiIds.length === 1) {
        const program = await prisma.programStudi.findUnique({
            where: { id: programStudiIds[0] },
            select: {
                id: true,
                nama_program_studi: true,
                universitas: { select: { nama: true } },
            },
        });

        const result = [{
            programStudiId: programStudiIds[0],
            nama: program?.nama_program_studi ?? "Unknown",
            universitas_nama: program?.universitas?.nama ?? null,
            netFlow: 0,
            leavingFlow: 0,
            enteringFlow: 0,
        }];

        return includeDetails ? { data: result, details: [] } : { data: result };
    }

    // Fetch mapping results
    const mappingResults: MappingResult[] = await evaluateCriteriaMapping(userId, programStudiIds);

    // Validate mapping results
    if (!mappingResults || mappingResults.length === 0) {
        throw new Error("No evaluation data available");
    }

    const subKriteriaList = await prisma.subKriteria.findMany();

    // Collect all unique criteria IDs in a consistent sorted order
    // Catatan: PROMETHEE basic pada proposal ini memakai rumus 2.7 (rata-rata 1/k)
    // sehingga bobot kriteria TIDAK dipakai pada indeks preferensi.
    const uniqueCriteriaIds = [...new Set(mappingResults.map((m) => m.kriteriaId))].sort();

    // Get ordered list of program IDs
    const ids = [...new Set(mappingResults.map((m) => m.programStudiId))];

    // Build matrix[i][k] = nilai program i on criterion k (aligned by criteriaId)
    const matrix = ids.map((id) => {
        const programItems = mappingResults.filter((m) => m.programStudiId === id);
        return uniqueCriteriaIds.map((kId) => {
            const item = programItems.find((m) => m.kriteriaId === kId);
            return item?.nilai ?? 0;
        });
    });

    const n = ids.length;
    const k = uniqueCriteriaIds.length; // jumlah kriteria
    // PROMETHEE basic (tipe preferensi Usual / rumus 2.1):
    //   H(d) = 1 jika d > 0, selain itu 0    (d = f(i) - f(j))
    // Indeks preferensi multikriteria (rumus 2.7):
    //   π(i,j) = (1/k) Σ_c H_c(i,j)          — rata-rata sederhana, TANPA bobot kriteria
    // φ+(i) = leaving flow  = Σ_j π(i,j) / (n-1)  — seberapa besar i mengungguli yang lain
    // φ-(i) = entering flow = Σ_j π(j,i) / (n-1)  — seberapa besar yang lain mengungguli i
    // φ(i)  = net flow      = φ+(i) - φ-(i)
    const phiPlus: number[] = new Array(n).fill(0);   // leaving flow  φ+
    const phiMinus: number[] = new Array(n).fill(0);  // entering flow φ-

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;

            // π(i,j): preferensi i terhadap j (usual criterion, rata-rata 1/k)
            let pi_ij = 0;
            for (let c = 0; c < k; c++) {
                const d = matrix[i][c] - matrix[j][c];
                pi_ij += d > 0 ? 1 : 0;
            }
            pi_ij = k > 0 ? pi_ij / k : 0; // rumus 2.7: bagi jumlah kriteria

            phiPlus[i] += pi_ij;   // Σ_j π(i,j) → leaving flow i
            phiMinus[j] += pi_ij;  // Σ_i π(i,j) → entering flow j
        }
    }

    // Normalize by (n-1)
    for (let i = 0; i < n; i++) {
        phiPlus[i] /= n - 1;
        phiMinus[i] /= n - 1;
    }

    // Net flow = φ+(i) - φ-(i)
    const netFlows = ids.map((id, i) => ({
        programStudiId: id,
        netFlow: phiPlus[i] - phiMinus[i],
        leavingFlow: phiPlus[i],
        enteringFlow: phiMinus[i],
    }));

    // Sort by netFlow (descending)
    netFlows.sort((a, b) => b.netFlow - a.netFlow);

    // Fetch program names + universitas
    const programMap = await prisma.programStudi.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            nama_program_studi: true,
            universitas: { select: { nama: true } },
        },
    });

    // Format results
    const results = netFlows.map((n) => {
        const p = programMap.find((p) => p.id === n.programStudiId);
        return {
            programStudiId: n.programStudiId,
            nama: p?.nama_program_studi ?? "",
            universitas_nama: p?.universitas?.nama ?? null,
            netFlow: Number.isFinite(n.netFlow) ? n.netFlow : 0,
            leavingFlow: Number.isFinite(n.leavingFlow) ? n.leavingFlow : 0,
            enteringFlow: Number.isFinite(n.enteringFlow) ? n.enteringFlow : 0,
        };
    });

    if (!includeDetails) {
        return { data: results };
    }



    // Prepare detailed results (ids order is stable — phiPlus/phiMinus indexed by same ids array)
    const details = ids.map((id, i) => {
        const program = programMap.find((p) => p.id === id);
        const nf = netFlows.find((nfItem) => nfItem.programStudiId === id);
        return {
            programStudiId: id,
            nama: program?.nama_program_studi ?? "",
            universitas_nama: program?.universitas?.nama ?? null,
            criteria: mappingResults
                .filter((item) => item.programStudiId === id)
                .map((item) => ({
                    name: item.criteriaName,
                    value: item.nilai,
                    weight: item.bobot,
                    subName: subKriteriaList.find((s) => s.id === item.subKriteriaId)?.nama_sub_kriteria ?? "-",
                    kriteriaId: item.kriteriaId,
                    subKriteriaId: item.subKriteriaId,
                })),
            leavingFlow: Number.isFinite(phiPlus[i]) ? phiPlus[i] : 0,
            enteringFlow: Number.isFinite(phiMinus[i]) ? phiMinus[i] : 0,
            netFlow: nf && Number.isFinite(nf.netFlow) ? nf.netFlow : 0,
        };
    });

    return {
        data: results,
        details: details.sort((a, b) => b.netFlow - a.netFlow),
    };
}