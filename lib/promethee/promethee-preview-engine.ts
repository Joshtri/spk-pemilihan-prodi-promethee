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
            select: { id: true, nama_program_studi: true },
        });

        const result = [{
            programStudiId: programStudiIds[0],
            nama: program?.nama_program_studi ?? "Unknown",
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
    const uniqueCriteriaIds = [...new Set(mappingResults.map((m) => m.kriteriaId))].sort();

    // Build criteria weight map and normalize weights
    const criteriaWeightMap = new Map<string, number>();
    for (const item of mappingResults) {
        if (!criteriaWeightMap.has(item.kriteriaId) && item.bobot) {
            criteriaWeightMap.set(item.kriteriaId, item.bobot);
        }
    }
    const totalWeight = uniqueCriteriaIds.reduce(
        (sum, kId) => sum + (criteriaWeightMap.get(kId) ?? 0),
        0
    );
    const normalizedWeights = uniqueCriteriaIds.map((kId) =>
        totalWeight > 0
            ? (criteriaWeightMap.get(kId) ?? 0) / totalWeight
            : 1 / uniqueCriteriaIds.length
    );

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
    const leavingFlows: number[] = new Array(n).fill(0);
    const enteringFlows: number[] = new Array(n).fill(0);

    // PROMETHEE II: compute π(i,j) and accumulate leaving/entering flows
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;

            // Aggregated preference π(i,j) = Σ_k [ w_k * P_k(i,j) ]
            // Usual preference function: P_k(i,j) = 1 if d > 0, else 0
            let pi_ij = 0;
            for (let k = 0; k < uniqueCriteriaIds.length; k++) {
                const d = matrix[i][k] - matrix[j][k];
                pi_ij += normalizedWeights[k] * (d > 0 ? 1 : 0);
            }

            leavingFlows[i] += pi_ij;   // φ+(i) += π(i,j)
            enteringFlows[j] += pi_ij;  // φ-(j) += π(i,j)
        }
    }

    // Normalize by (n-1)
    for (let i = 0; i < n; i++) {
        leavingFlows[i] /= n - 1;
        enteringFlows[i] /= n - 1;
    }

    // Calculate net flows
    const netFlows = ids.map((id, i) => ({
        programStudiId: id,
        netFlow: leavingFlows[i] - enteringFlows[i],
        leavingFlow: leavingFlows[i],
        enteringFlow: enteringFlows[i],
    }));

    // Sort by netFlow (descending)
    netFlows.sort((a, b) => b.netFlow - a.netFlow);

    // Fetch program names
    const programMap = await prisma.programStudi.findMany({
        where: { id: { in: ids } },
        select: { id: true, nama_program_studi: true },
    });

    // Format results
    const results = netFlows.map((n) => ({
        programStudiId: n.programStudiId,
        nama: programMap.find((p) => p.id === n.programStudiId)?.nama_program_studi ?? "",
        netFlow: Number.isFinite(n.netFlow) ? n.netFlow : 0,
        leavingFlow: Number.isFinite(n.leavingFlow) ? n.leavingFlow : 0,
        enteringFlow: Number.isFinite(n.enteringFlow) ? n.enteringFlow : 0,
    }));

    if (!includeDetails) {
        return { data: results };
    }



    // Prepare detailed results (use ids index for flows — ids order is stable before sorting)
    const details = ids.map((id, i) => {
        const program = programMap.find((p) => p.id === id);
        const nf = netFlows.find((nfItem) => nfItem.programStudiId === id);
        return {
            programStudiId: id,
            nama: program?.nama_program_studi ?? "",
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
            leavingFlow: Number.isFinite(leavingFlows[i]) ? leavingFlows[i] : 0,
            enteringFlow: Number.isFinite(enteringFlows[i]) ? enteringFlows[i] : 0,
            netFlow: nf && Number.isFinite(nf.netFlow) ? nf.netFlow : 0,
        };
    });

    return {
        data: results,
        details: details.sort((a, b) => b.netFlow - a.netFlow),
    };
}