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
                    programStudi: true,
                },
            }),
            prisma.pilihanProgramStudi.findMany({
                where: { userId },
                include: {
                    programStudi: true,
                },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        // Hitung rata-rata nilai akademik
        const averageScore =
            nilaiAkademik.length > 0
                ? nilaiAkademik.reduce((sum, n) => sum + n.nilai, 0) / nilaiAkademik.length
                : 0;

        // Ambil skor tertinggi dari hasil perhitungan
        const topMatch = hasilPerhitungan.sort((a, b) => b.nilai - a.nilai)[0];

        // Hitung distribusi rumpun ilmu dari hasil perhitungan
        const rumpunIlmuCount: Record<string, number> = {};
        hasilPerhitungan.forEach((h) => {
            const rumpun = h.programStudi?.rumpunIlmuId || "Lainnya";
            rumpunIlmuCount[rumpun] = (rumpunIlmuCount[rumpun] || 0) + 1;
        });

        const rumpunIlmuDistribution = Object.entries(rumpunIlmuCount).map(
            ([key, val]) => ({ name: key, value: val })
        );

        return NextResponse.json({
            nilaiAkademik,
            tesMinat,
            hasilPerhitungan,
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
