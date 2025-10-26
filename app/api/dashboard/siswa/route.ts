// route: /api/dashboard/siswa/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Hardcoded userId untuk sementara waktu
        const userId = "b24db3c5-0dbc-4deb-9881-db4801245632";

        // Ambil data secara paralel
        const [
            nilaiAkademik,
            tesMinat,
            hasilPerhitungan,
            pilihanProdi,
        ] = await Promise.all([
            prisma.nilaiAkademikSiswa.findMany({ where: { userId } }),
            prisma.tesMinatSiswa.findMany({ where: { userId } }),
            prisma.hasilPerhitungan.findMany({
                where: { userId },
                include: {
                    programStudi: {
                        include: {
                            RumpunIlmu: true,
                        }
                    },
                },
            }),
            prisma.pilihanProgramStudi.findMany({
                where: { userId },
                include: {
                    programStudi: {
                        include: {
                            RumpunIlmu: true,
                        }
                    },
                },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        // Hitung rata-rata nilai akademik
        const averageScore =
            nilaiAkademik.length > 0
                ? Math.round(nilaiAkademik.reduce((sum, n) => sum + n.nilai, 0) / nilaiAkademik.length)
                : 0;

        // Aggregate hasil perhitungan by program studi
        const programStudiScores: Record<string, {
            sum: number;
            count: number;
            programStudi: any
        }> = {};

        hasilPerhitungan.forEach((h) => {
            const prodiId = h.programStudiId;
            if (!programStudiScores[prodiId]) {
                programStudiScores[prodiId] = {
                    sum: 0,
                    count: 0,
                    programStudi: h.programStudi,
                };
            }
            programStudiScores[prodiId].sum += h.nilai;
            programStudiScores[prodiId].count += 1;
        });

        // Convert to array and calculate average match score
        const rekomendasiProdi = Object.entries(programStudiScores)
            .map(([prodiId, data]) => ({
                id: prodiId,
                name: data.programStudi.nama_program_studi,
                akreditasi: data.programStudi.akreditasi,
                biaya: `Rp ${(data.programStudi.biaya_kuliah / 1000000).toFixed(1)}jt/semester`,
                biaya_kuliah: data.programStudi.biaya_kuliah,
                match: Math.round((data.sum / data.count) * 100) / 100, // Match score sebagai persentase
                rumpunIlmu: data.programStudi.RumpunIlmu?.nama || "Lainnya",
            }))
            .sort((a, b) => b.match - a.match); // Sort by match descending

        // Ambil skor tertinggi
        const topMatch = rekomendasiProdi[0] || null;

        // Hitung distribusi rumpun ilmu dari rekomendasi
        const rumpunIlmuCount: Record<string, number> = {};
        rekomendasiProdi.forEach((prodi) => {
            const rumpun = prodi.rumpunIlmu;
            rumpunIlmuCount[rumpun] = (rumpunIlmuCount[rumpun] || 0) + 1;
        });

        const rumpunIlmuDistribution = Object.entries(rumpunIlmuCount).map(
            ([key, val]) => ({ name: key, value: val })
        );

        return NextResponse.json({
            nilaiAkademik,
            tesMinat,
            hasilPerhitungan: rekomendasiProdi, // Return aggregated data
            pilihanProdi,
            averageScore,
            topMatch,
            rumpunIlmuDistribution,
        });
    } catch (error) {
        console.error("Failed to load siswa dashboard data:", error);
        return NextResponse.json(
            { error: "Failed to load dashboard data" },
            { status: 500 }
        );
    }
}
