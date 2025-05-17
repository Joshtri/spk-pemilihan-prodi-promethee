// app/api/dashboard/riasec-distribution/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const allResults = await prisma.tesMinatSiswa.findMany({
            select: { tipe: true },
        });

        // Hitung per huruf, misalnya 'RIA' = R + I + A
        const counts: Record<string, number> = {};

        allResults.forEach((entry) => {
            const types = entry.tipe.split(','); // jika dipisahkan koma
            types.forEach((t) => {
                const key = t.trim();
                counts[key] = (counts[key] || 0) + 1;
            });
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);

        const distribution = Object.entries(counts).map(([tipe, count]) => ({
            name: getRiasecName(tipe),
            value: count,
            percentage: (count / total) * 100,
        }));

        return NextResponse.json(distribution);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch RIASEC distribution" },
            { status: 500 }
        );
    }
}

function getRiasecName(tipe: string): string {
    const mapping: Record<string, string> = {
        R: 'Realistic',
        I: 'Investigative',
        A: 'Artistic',
        S: 'Social',
        E: 'Enterprising',
        C: 'Conventional',
    };
    return mapping[tipe] || tipe;
}
