import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function evaluateCriteriaMapping(userId: string, programStudiIds: string[]) {
    const [tesMinat, nilaiAkademik, programStudiList, subKriteriaList, kriteriaList] =
        await Promise.all([
            prisma.tesMinatSiswa.findMany({ where: { userId } }),
            prisma.nilaiAkademikSiswa.findMany({ where: { userId } }),
            prisma.programStudi.findMany({
                where: { id: { in: programStudiIds } },
                include: { riasec: true },
            }),
            prisma.subKriteria.findMany(),
            prisma.kriteria.findMany(),
        ]);

    const tesMinatTypes = tesMinat.map((t) => t.tipe);

    const minatKriteria = kriteriaList.find((k) => k.nama_kriteria === "Minat");
    const akademikKriteria = kriteriaList.find((k) => k.nama_kriteria === "Nilai Akademik");
    const biayaKriteria = kriteriaList.find((k) => k.nama_kriteria === "Biaya Kuliah");
    const akreditasiKriteria = kriteriaList.find((k) => k.nama_kriteria === "Akreditasi Progam Studi");

    const results: {
        programStudiId: string;
        kriteriaId: string;
        subKriteriaId: string;
        nilai: number;
        criteriaName: string;
        bobot: number;
        subName: string;
    }[] = [];

    function pushResult(psId: string, kriteria, sub) {
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
        if (minatKriteria) {
            const riasecTypesProdi = ps.riasec.flatMap((r) =>
                r.tipeRiasec.split(",").map((t) => t.trim().toUpperCase())
            );

            const tesMinatTypesClean = tesMinatTypes.flatMap((t) =>
                t.split(",").map((x) => x.trim().toUpperCase())
            );

            const matchedTypes = riasecTypesProdi.filter((t) =>
                tesMinatTypesClean.includes(t)
            );

            const matchCount = matchedTypes.length;

            let minatSub = "";
            if (matchCount >= 2) {
                // semua 2 atau lebih dianggap cocok
                minatSub = "Lebih Dari 2 Tipe Cocok";
            } else if (matchCount === 1) {
                minatSub = "1 Tipe Cocok";
            } else {
                minatSub = "Tidak Ada Yang Cocok";
            }


            const sub = subKriteriaList.find(
                (s) => s.kriteriaId === minatKriteria.id && s.nama_sub_kriteria === minatSub
            );

            if (sub) {
                results.push({
                    programStudiId: ps.id,
                    kriteriaId: minatKriteria.id,
                    subKriteriaId: sub.id,
                    nilai: sub.bobot_sub_kriteria,
                    criteriaName: minatKriteria.nama_kriteria,
                    bobot: minatKriteria.bobot_kriteria,
                    subName: sub.nama_sub_kriteria,
                });
            }

            // debug log
            console.log({
                prodi: ps.nama_program_studi,
                prodiTypes: riasecTypesProdi,
                userMinat: tesMinatTypesClean,
                matchedTypes,
                matchCount,
                selectedSub: minatSub,
            });
        }

        // --- Nilai Akademik ---
        if (akademikKriteria) {
            const mapelPs = await prisma.mataPelajaranPendukung.findFirst({
                where: { programStudiId: ps.id },
            });

            const namaMapel = mapelPs?.nama_mata_pelajaran;

            const nilaiAkademikSiswa = nilaiAkademik.find((n) => n.pelajaran === namaMapel);
            const nilai = nilaiAkademikSiswa?.nilai ?? 0;

            const akademikSubs = subKriteriaList.filter((s) => s.kriteriaId === akademikKriteria.id);

            let matchedSub: typeof akademikSubs[0] | null = null;

            for (const sub of akademikSubs) {
                const label = sub.nama_sub_kriteria;

                if (/^\d{2}-\d{2}$/.test(label)) {
                    const [min, max] = label.split("-").map(Number);
                    if (nilai >= min && nilai <= max) {
                        matchedSub = sub;
                        break;
                    }
                }
            }

            // fallback jika nilai di bawah semua range
            if (!matchedSub && akademikSubs.length > 0) {
                matchedSub = akademikSubs.reduce((lowest, current) =>
                    current.bobot_sub_kriteria < lowest.bobot_sub_kriteria ? current : lowest
                );
            }

            if (matchedSub) {
                pushResult(ps.id, akademikKriteria, matchedSub);

                // debug
                console.log({
                    prodi: ps.nama_program_studi,
                    mapel: namaMapel,
                    nilai,
                    selectedSub: matchedSub.nama_sub_kriteria,
                });
            }
        }

        // --- Biaya Kuliah ---
        // --- Biaya Kuliah ---
        if (biayaKriteria) {
            const biayaSubs = subKriteriaList.filter((s) => s.kriteriaId === biayaKriteria.id);
            const biaya = ps.biaya_kuliah;

            let matchedSub: typeof biayaSubs[0] | null = null;

            for (const sub of biayaSubs) {
                const label = sub.nama_sub_kriteria.replace(/\s/g, ""); // hapus spasi

                // 21.429.000–22.273.000
                if (label.includes("–")) {
                    const [minStr, maxStr] = label.split("–");
                    const min = Number(minStr.replace(/\./g, ""));
                    const max = Number(maxStr.replace(/\./g, ""));
                    if (biaya >= min && biaya <= max) {
                        matchedSub = sub;
                        break;
                    }
                }
                // <=10.137.000
                else if (label.startsWith("<=")) {
                    const max = Number(label.replace(/[^0-9]/g, ""));
                    if (biaya <= max) {
                        matchedSub = sub;
                        break;
                    }
                }
                // >=37.831.000
                else if (label.startsWith(">=")) {
                    const min = Number(label.replace(/[^0-9]/g, ""));
                    if (biaya >= min) {
                        matchedSub = sub;
                        break;
                    }
                }
                // 19.804.000 (exact match)
                else {
                    const exact = Number(label.replace(/\./g, ""));
                    if (biaya === exact) {
                        matchedSub = sub;
                        break;
                    }
                }
            }

            // fallback ke bobot terendah jika tidak cocok
            if (!matchedSub && biayaSubs.length > 0) {
                matchedSub = biayaSubs.reduce((lowest, current) =>
                    current.bobot_sub_kriteria < lowest.bobot_sub_kriteria ? current : lowest
                );
            }

            if (matchedSub) {
                pushResult(ps.id, biayaKriteria, matchedSub);

                // debug
                console.log({
                    prodi: ps.nama_program_studi,
                    biaya,
                    selectedSub: matchedSub.nama_sub_kriteria,
                    bobot: matchedSub.bobot_sub_kriteria,
                });
            }
        }


        // --- Akreditasi ---
        if (akreditasiKriteria) {
            const sub = subKriteriaList.find(
                (s) => s.kriteriaId === akreditasiKriteria.id && s.nama_sub_kriteria.includes(ps.akreditasi)
            );
            if (sub) pushResult(ps.id, akreditasiKriteria, sub);
        }

        // --- Tambahkan nilai default jika tidak ditemukan ---
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
