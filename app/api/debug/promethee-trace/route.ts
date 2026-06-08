import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const TARGET_USER = "c47ea5ea-bfd1-4365-bfe5-38e6d455917b";

export async function GET() {
    const userId = TARGET_USER;

    // 1. Ambil pilihan program studi
    const pilihanList = await prisma.pilihanProgramStudi.findMany({
        where: { userId },
        include: { programStudi: { include: { mataPelajaranPendukung: true, riasec: true } } },
    });
    const programIds = pilihanList.map((p) => p.programStudiId);

    if (programIds.length === 0) {
        return NextResponse.json({ error: "Tidak ada pilihan program studi untuk user ini" });
    }

    // 2. Data siswa
    const nilaiAkademik = await prisma.nilaiAkademikSiswa.findMany({ where: { userId } });
    const tesMinat = await prisma.tesMinatSiswa.findMany({ where: { userId } });

    // 3. Kriteria & sub-kriteria
    const kriteriaList = await prisma.kriteria.findMany({ include: { subKriteria: true } });
    const subKriteriaList = await prisma.subKriteria.findMany();

    // Helper
    function sortedSubs(kriteriaId: string) {
        return subKriteriaList
            .filter((s) => s.kriteriaId === kriteriaId)
            .sort((a, b) => b.bobot_sub_kriteria - a.bobot_sub_kriteria);
    }

    const minatK = kriteriaList.find((k) => k.nama_kriteria === "Minat");
    const akademikK = kriteriaList.find((k) => k.nama_kriteria === "Nilai Akademik");
    const biayaK = kriteriaList.find((k) => k.nama_kriteria === "Biaya Kuliah");
    const akreditasiK = kriteriaList.find((k) => k.nama_kriteria === "Akreditasi Program Studi");

    const tesMinatTypes = tesMinat.flatMap((t) =>
        t.tipe.split(",").map((x) => x.trim().toUpperCase())
    );

    // 4. Hitung nilai tiap prodi per kriteria
    const matrixRows: {
        prodi: string;
        prodiId: string;
        minat: number;
        akademik: number;
        biaya: number;
        akreditasi: number;
        minatSub: string;
        akademikSub: string;
        biayaSub: string;
        akreditasiSub: string;
        nilaiAvg: number;
        matchCount: number;
    }[] = [];

    for (const pilihan of pilihanList) {
        const ps = pilihan.programStudi;

        // Minat
        const riasecTypes = ps.riasec.flatMap((r: any) =>
            r.tipeRiasec.split(",").map((t: string) => t.trim().toUpperCase())
        );
        const matchCount = riasecTypes.filter((t: string) => tesMinatTypes.includes(t)).length;
        const minatSubs = minatK ? sortedSubs(minatK.id) : [];
        const minatIdx = matchCount >= 2 ? 0 : matchCount === 1 ? 1 : minatSubs.length - 1;
        const minatSub = minatSubs[Math.min(minatIdx, minatSubs.length - 1)];

        // Akademik
        const namaMapels = ps.mataPelajaranPendukung.map((m: any) => m.nama_mata_pelajaran);
        const matchedNilai = nilaiAkademik.filter((n) => namaMapels.includes(n.pelajaran));
        const avgScore = matchedNilai.length > 0
            ? Math.round(matchedNilai.reduce((s, n) => s + n.nilai, 0) / matchedNilai.length)
            : 0;
        const akademikSubs = akademikK ? sortedSubs(akademikK.id) : [];
        // proposal Tabel 3.5: 95-100→5, 90-94→4, 85-89→3, 80-84→2, 75-79→1
        const akIdx = avgScore >= 95 ? 0 : avgScore >= 90 ? 1 : avgScore >= 85 ? 2 : avgScore >= 80 ? 3 : akademikSubs.length - 1;
        const akademikSub = akademikSubs[Math.min(akIdx, akademikSubs.length - 1)];

        // Biaya
        const biaya = ps.biaya_kuliah;
        const biayaSubs = biayaK ? sortedSubs(biayaK.id) : [];
        const biayaIdx =
            biaya <= 10_137_000 ? 0 :
            biaya <= 15_788_000 ? 1 :
            biaya <= 19_804_000 ? 2 :
            biaya <= 22_273_000 ? 3 :
            biayaSubs.length - 1;
        const biayaSub = biayaSubs[Math.min(biayaIdx, biayaSubs.length - 1)];

        // Akreditasi
        const akreditasiSubs = akreditasiK ? sortedSubs(akreditasiK.id) : [];
        const grade = ps.akreditasi.trim().toUpperCase();
        const akrIdx = grade === "A" ? 0 : grade === "B" ? 1 : grade === "C" ? 2 : akreditasiSubs.length - 1;
        const akreditasiSub = akreditasiSubs[Math.min(akrIdx, akreditasiSubs.length - 1)];

        matrixRows.push({
            prodi: ps.nama_program_studi,
            prodiId: ps.id,
            minat: minatSub?.bobot_sub_kriteria ?? 0,
            akademik: akademikSub?.bobot_sub_kriteria ?? 0,
            biaya: biayaSub?.bobot_sub_kriteria ?? 0,
            akreditasi: akreditasiSub?.bobot_sub_kriteria ?? 0,
            minatSub: minatSub?.nama_sub_kriteria ?? "-",
            akademikSub: akademikSub?.nama_sub_kriteria ?? "-",
            biayaSub: biayaSub?.nama_sub_kriteria ?? "-",
            akreditasiSub: akreditasiSub?.nama_sub_kriteria ?? "-",
            nilaiAvg: avgScore,
            matchCount,
        });
    }

    // 5. Bobot kriteria
    const weights = {
        minat: minatK?.bobot_kriteria ?? 0,
        akademik: akademikK?.bobot_kriteria ?? 0,
        biaya: biayaK?.bobot_kriteria ?? 0,
        akreditasi: akreditasiK?.bobot_kriteria ?? 0,
    };
    const totalW = weights.minat + weights.akademik + weights.biaya + weights.akreditasi;
    const normW = {
        minat: totalW > 0 ? weights.minat / totalW : 0.25,
        akademik: totalW > 0 ? weights.akademik / totalW : 0.25,
        biaya: totalW > 0 ? weights.biaya / totalW : 0.25,
        akreditasi: totalW > 0 ? weights.akreditasi / totalW : 0.25,
    };

    // 6. Hitung preferensi π(i,j)
    const n = matrixRows.length;
    const piMatrix: { from: string; to: string; pi: number; detail: any }[] = [];

    const phiPlus = new Array(n).fill(0);   // leaving flow φ+
    const phiMinus = new Array(n).fill(0);  // entering flow φ-

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const a = matrixRows[i];
            const b = matrixRows[j];

            const dMinat = a.minat - b.minat;
            const dAkademik = a.akademik - b.akademik;
            const dBiaya = a.biaya - b.biaya;
            const dAkreditasi = a.akreditasi - b.akreditasi;

            const pMinat = dMinat > 0 ? 1 : 0;
            const pAkademik = dAkademik > 0 ? 1 : 0;
            const pBiaya = dBiaya > 0 ? 1 : 0;
            const pAkreditasi = dAkreditasi > 0 ? 1 : 0;

            // rumus 2.7: π = (1/k) Σ H(d), k = jumlah kriteria (tanpa bobot)
            const K = 4;
            const pi = (pMinat + pAkademik + pBiaya + pAkreditasi) / K;

            piMatrix.push({
                from: a.prodi,
                to: b.prodi,
                pi: Math.round(pi * 10000) / 10000,
                detail: { dMinat, dAkademik, dBiaya, dAkreditasi, pMinat, pAkademik, pBiaya, pAkreditasi },
            });

            phiPlus[i] += pi;
            phiMinus[j] += pi;
        }
    }

    // 7. Normalize
    for (let i = 0; i < n; i++) {
        phiPlus[i] = phiPlus[i] / (n - 1);
        phiMinus[i] = phiMinus[i] / (n - 1);
    }

    // 8. Net flow & ranking
    const ranking = matrixRows
        .map((row, i) => ({
            prodi: row.prodi,
            leavingFlow: Math.round(phiPlus[i] * 10000) / 10000,
            enteringFlow: Math.round(phiMinus[i] * 10000) / 10000,
            netFlow: Math.round((phiPlus[i] - phiMinus[i]) * 10000) / 10000,
        }))
        .sort((a, b) => b.netFlow - a.netFlow);

    return NextResponse.json({
        userId,
        tesMinat: tesMinatTypes,
        nilaiAkademik: nilaiAkademik.map((n) => ({ pelajaran: n.pelajaran, nilai: n.nilai })),
        kriteria: { weights, normW },
        matrix: matrixRows.map((r) => ({
            prodi: r.prodi,
            minat: `${r.minatSub}(${r.minat})`,
            akademik: `${r.akademikSub}(${r.akademik}) avg=${r.nilaiAvg}`,
            biaya: `${r.biayaSub}(${r.biaya})`,
            akreditasi: `${r.akreditasiSub}(${r.akreditasi})`,
        })),
        piMatrix,
        ranking,
    });
}
