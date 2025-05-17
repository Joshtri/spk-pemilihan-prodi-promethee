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

    // Group by program studi
    const grouped = new Map<string, number[]>();
    for (const item of mappingResults) {
        if (!grouped.has(item.programStudiId)) {
            grouped.set(item.programStudiId, []);
        }
        grouped.get(item.programStudiId)!.push(item.nilai);
    }

    const subKriteriaList = await prisma.subKriteria.findMany();

    // Create matrix
    const ids = [...grouped.keys()];
    const matrix = ids.map((id) => grouped.get(id) ?? []);

    // Calculate flows
    const leavingFlows: number[] = [];
    const enteringFlows: number[] = [];

    for (let i = 0; i < matrix.length; i++) {
        let leavingSum = 0;
        let enteringSum = 0;

        for (let j = 0; j < matrix.length; j++) {
            if (i === j) continue;

            const d_ij = matrix[i].reduce((sum, val, idx) => sum + (val - matrix[j][idx]), 0);
            leavingSum += d_ij;
            enteringSum += -d_ij;
        }

        leavingFlows[i] = matrix.length > 1 ? leavingSum / (matrix.length - 1) : 0;
        enteringFlows[i] = matrix.length > 1 ? enteringSum / (matrix.length - 1) : 0;
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



    // Prepare detailed results
    const details = ids.map((id, i) => {
        const program = programMap.find((p) => p.id === id);
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
                })),
            leavingFlow: Number.isFinite(leavingFlows[i]) ? leavingFlows[i] : 0,
            enteringFlow: Number.isFinite(enteringFlows[i]) ? enteringFlows[i] : 0,
            netFlow: Number.isFinite(netFlows[i].netFlow) ? netFlows[i].netFlow : 0,
        };
    });

    return {
        data: results,
        details: details.sort((a, b) => b.netFlow - a.netFlow),
    };
}