// File: app/api/promethee/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/utils/auth";
import prisma from "@/lib/prisma";


export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { details } = body;

        if (!Array.isArray(details) || details.length === 0) {
            return NextResponse.json({ message: "No details provided" }, { status: 400 });
        }

        // Flatten all criteria entries
        const entries = details.flatMap((item: any) =>
            item.criteria.map((crit: any) => ({
                userId: user.id,
                programStudiId: item.programStudiId,
                kriteriaId: crit.kriteriaId,
                subKriteriaId: crit.subKriteriaId,
                nilai: crit.value,
            }))
        );


        // Optional: delete previous results
        await prisma.hasilPerhitungan.deleteMany({
            where: { userId: user.id },
        });

        // Validate that all required fields exist
        const validEntries = entries.filter(
            (e) => e.kriteriaId && e.subKriteriaId && typeof e.nilai === "number"
        );

        if (validEntries.length === 0) {
            return NextResponse.json({ message: "Invalid data in details" }, { status: 400 });
        }

        const saved = await prisma.hasilPerhitungan.createMany({
            data: validEntries,
        });

        return NextResponse.json({
            message: "Berhasil menyimpan hasil",
            count: saved.count,
        });
    } catch (error) {
        console.error("Save PROMETHEE error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}