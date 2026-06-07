import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/utils/auth";

export async function GET() {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = user.id;

        const [nilaiAkademik, tesMinat, hasilPerhitungan, pilihanProdi] = await Promise.all([
            prisma.nilaiAkademikSiswa.findMany({ where: { userId } }),
            prisma.tesMinatSiswa.findMany({ where: { userId } }),
            prisma.hasilPerhitungan.findMany({
                where: { userId },
                include: {
                    programStudi: {
                        include: {
                            RumpunIlmu: true,
                            mataPelajaranPendukung: true,
                            riasec: true,
                        },
                    },
                },
            }),
            prisma.pilihanProgramStudi.findMany({
                where: { userId },
                include: {
                    programStudi: {
                        include: { RumpunIlmu: true },
                    },
                },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        const averageScore =
            nilaiAkademik.length > 0
                ? Math.round(nilaiAkademik.reduce((sum, n) => sum + n.nilai, 0) / nilaiAkademik.length)
                : 0;

        // Aggregate hasilPerhitungan by program studi
        const MAX_BOBOT = 5;
        const programStudiScores: Record<string, {
            sum: number;
            count: number;
            programStudi: any;
            mataPelajaran: string[];
            riasecTypes: string[];
        }> = {};

        hasilPerhitungan.forEach((h) => {
            const prodiId = h.programStudiId;
            if (!programStudiScores[prodiId]) {
                const ps = h.programStudi;
                programStudiScores[prodiId] = {
                    sum: 0,
                    count: 0,
                    programStudi: ps,
                    mataPelajaran: ps.mataPelajaranPendukung?.map((m: any) => m.nama_mata_pelajaran) ?? [],
                    riasecTypes: ps.riasec?.flatMap((r: any) =>
                        r.tipeRiasec.split(",").map((t: string) => t.trim())
                    ) ?? [],
                };
            }
            programStudiScores[prodiId].sum += h.nilai;
            programStudiScores[prodiId].count += 1;
        });

        // match = (avg bobot / max bobot) * 100, capped at 100
        const rekomendasiProdi = Object.entries(programStudiScores)
            .map(([prodiId, data]) => ({
                id: prodiId,
                name: data.programStudi.nama_program_studi,
                akreditasi: data.programStudi.akreditasi,
                biaya: `Rp ${(data.programStudi.biaya_kuliah / 1_000_000).toFixed(1)}jt/semester`,
                biaya_kuliah: data.programStudi.biaya_kuliah,
                match: Math.min(100, Math.round((data.sum / (data.count * MAX_BOBOT)) * 100)),
                rumpunIlmu: data.programStudi.RumpunIlmu?.nama || "Lainnya",
                mataPelajaran: data.mataPelajaran,
                riasecTypes: data.riasecTypes,
            }))
            .sort((a, b) => b.match - a.match);

        const topMatch = rekomendasiProdi[0] || null;

        const rumpunIlmuCount: Record<string, number> = {};
        rekomendasiProdi.forEach((p) => {
            rumpunIlmuCount[p.rumpunIlmu] = (rumpunIlmuCount[p.rumpunIlmu] || 0) + 1;
        });
        const rumpunIlmuDistribution = Object.entries(rumpunIlmuCount).map(
            ([key, val]) => ({ name: key, value: val })
        );

        return NextResponse.json({
            nilaiAkademik,
            tesMinat,
            hasilPerhitungan: rekomendasiProdi,
            pilihanProdi,
            averageScore,
            topMatch,
            rumpunIlmuDistribution,
        });
    } catch (error) {
        console.error("Failed to load siswa dashboard data:", error);
        return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
    }
}
