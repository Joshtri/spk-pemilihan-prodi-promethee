import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Return sub-kriteria for a given kriteria sorted by bobot DESC (best → worst). */
function sortedSubs(subKriteriaList: any[], kriteriaId: string) {
    return subKriteriaList
        .filter((s) => s.kriteriaId === kriteriaId)
        .sort((a, b) => b.bobot_sub_kriteria - a.bobot_sub_kriteria);
}

export async function evaluateCriteriaMapping(userId: string, programStudiIds: string[]) {
    const [tesMinat, nilaiAkademik, programStudiList, subKriteriaList, kriteriaList] =
        await Promise.all([
            prisma.tesMinatSiswa.findMany({ where: { userId } }),
            prisma.nilaiAkademikSiswa.findMany({ where: { userId } }),
            prisma.programStudi.findMany({
                where: { id: { in: programStudiIds } },
                include: { riasec: true, mataPelajaranPendukung: true },
            }),
            prisma.subKriteria.findMany(),
            prisma.kriteria.findMany(),
        ]);

    const tesMinatTypes = tesMinat.map((t) => t.tipe);

    const minatKriteria     = kriteriaList.find((k) => k.nama_kriteria === "Minat");
    const akademikKriteria  = kriteriaList.find((k) => k.nama_kriteria === "Nilai Akademik");
    const biayaKriteria     = kriteriaList.find((k) => k.nama_kriteria === "Biaya Kuliah");
    const akreditasiKriteria = kriteriaList.find((k) => k.nama_kriteria === "Akreditasi Program Studi");

    const results: {
        programStudiId: string;
        kriteriaId: string;
        subKriteriaId: string;
        nilai: number;
        criteriaName: string;
        bobot: number;
        subName: string;
    }[] = [];

    function pushResult(psId: string, kriteria: any, sub: any) {
        results.push({
            programStudiId: psId,
            kriteriaId: kriteria.id,
            subKriteriaId: sub.id,
            nilai: sub.bobot_sub_kriteria,
            criteriaName: kriteria.nama_kriteria,
            bobot: kriteria.bobot_kriteria,
            subName: sub.nama_sub_kriteria,
        });
    }

    for (const ps of programStudiList) {

        // --- Minat ---
        // DB codes (sorted by bobot DESC): SM1(5) > SM2(3) > SM3(1)
        // matchCount >= 2 → rank 0 (best), == 1 → rank 1, == 0 → rank 2 (worst)
        if (minatKriteria) {
            const riasecTypesProdi = ps.riasec.flatMap((r: any) =>
                r.tipeRiasec.split(",").map((t: string) => t.trim().toUpperCase())
            );
            const tesMinatTypesClean = tesMinatTypes.flatMap((t) =>
                t.split(",").map((x) => x.trim().toUpperCase())
            );
            const matchCount = riasecTypesProdi.filter((t: string) =>
                tesMinatTypesClean.includes(t)
            ).length;

            const minatSubs = sortedSubs(subKriteriaList, minatKriteria.id);
            const idx = matchCount >= 2 ? 0 : matchCount === 1 ? 1 : minatSubs.length - 1;
            const sub = minatSubs[Math.min(idx, minatSubs.length - 1)];
            if (sub) pushResult(ps.id, minatKriteria, sub);

            console.log({ prodi: ps.nama_program_studi, riasecTypesProdi, tesMinatTypesClean, matchCount, selectedSub: sub?.nama_sub_kriteria });
        }

        // --- Nilai Akademik ---
        // DB codes (sorted by bobot DESC): NA1(5) > NA2(4) > NA3(3) > NA4(2) > NA5(1)
        // Ranges from proposal: ≥96→5, 91-95→4, 85-90→3, 80-84→2, <80→1
        // For programs with multiple supporting subjects, average the student's available scores.
        if (akademikKriteria) {
            const namaMapels = ps.mataPelajaranPendukung.map((m: any) => m.nama_mata_pelajaran);
            const matchedNilai = nilaiAkademik.filter((n) => namaMapels.includes(n.pelajaran));
            const score = matchedNilai.length > 0
                ? Math.round(matchedNilai.reduce((sum, n) => sum + n.nilai, 0) / matchedNilai.length)
                : 0;

            const akademikSubs = sortedSubs(subKriteriaList, akademikKriteria.id);
            const idx = score >= 96 ? 0 : score >= 91 ? 1 : score >= 85 ? 2 : score >= 80 ? 3 : akademikSubs.length - 1;
            const sub = akademikSubs[Math.min(idx, akademikSubs.length - 1)];
            if (sub) pushResult(ps.id, akademikKriteria, sub);

            console.log({ prodi: ps.nama_program_studi, mapels: namaMapels, score, selectedSub: sub?.nama_sub_kriteria });
        }

        // --- Biaya Kuliah ---
        // DB codes (sorted by bobot DESC): SS1(5) > SS2(4) > SS3(3) > SS4(2) > SS5(1)
        // Cheaper = better (higher rank). Ranges based on actual program studi distribution.
        if (biayaKriteria) {
            const biaya = ps.biaya_kuliah;
            const biayaSubs = sortedSubs(subKriteriaList, biayaKriteria.id);

            let idx: number;
            if (biaya <= 10_137_000)       idx = 0; // SS1 — cheapest
            else if (biaya <= 15_788_000)  idx = 1; // SS2
            else if (biaya <= 19_804_000)  idx = 2; // SS3
            else if (biaya <= 22_273_000)  idx = 3; // SS4
            else                           idx = biayaSubs.length - 1; // SS5 — most expensive

            const sub = biayaSubs[Math.min(idx, biayaSubs.length - 1)];
            if (sub) pushResult(ps.id, biayaKriteria, sub);

            console.log({ prodi: ps.nama_program_studi, biaya, selectedSub: sub?.nama_sub_kriteria });
        }

        // --- Akreditasi ---
        // DB codes (sorted by bobot DESC): S1(4) > S2(3) > S3(2) > S4(1)
        // A → rank 0, B → rank 1, C → rank 2, other → rank 3
        if (akreditasiKriteria) {
            const akreditasiSubs = sortedSubs(subKriteriaList, akreditasiKriteria.id);
            const grade = ps.akreditasi.trim().toUpperCase();
            const idx = grade === "A" ? 0 : grade === "B" ? 1 : grade === "C" ? 2 : akreditasiSubs.length - 1;
            const sub = akreditasiSubs[Math.min(idx, akreditasiSubs.length - 1)];
            if (sub) pushResult(ps.id, akreditasiKriteria, sub);

            console.log({ prodi: ps.nama_program_studi, akreditasi: ps.akreditasi, selectedSub: sub?.nama_sub_kriteria });
        }

        // --- Fallback: ensure every criterion has an entry (nilai 0 if not matched) ---
        for (const k of kriteriaList) {
            const alreadyMapped = results.find(
                (r) => r.programStudiId === ps.id && r.kriteriaId === k.id
            );
            if (!alreadyMapped) {
                results.push({
                    programStudiId: ps.id,
                    kriteriaId: k.id,
                    subKriteriaId: "",
                    nilai: 0,
                    criteriaName: k.nama_kriteria,
                    bobot: k.bobot_kriteria,
                    subName: "-",
                });
            }
        }
    }

    return results;
}
