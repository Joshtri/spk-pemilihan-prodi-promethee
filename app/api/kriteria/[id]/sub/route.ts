// /app/api/kriteria/[id]/sub/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        const subs = await prisma.subKriteria.findMany({
            where: { kriteriaId: params.id },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ success: true, data: subs });
    } catch (err) {
        console.error("Error fetching sub kriteria:", err);
        return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
    }
}
