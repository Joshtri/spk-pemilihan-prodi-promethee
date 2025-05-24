// File: app/api/promethee/history/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/utils/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const user = await getUserFromCookie();

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hasil = await prisma.hasilPerhitungan.findMany({
        where: { userId: user.id },
        include: {
            programStudi: true,
            kriteria: true,
            subKriteria: true,
        },
        orderBy: { createdAt: "desc" },

    });

    return NextResponse.json({ data: hasil });
}
