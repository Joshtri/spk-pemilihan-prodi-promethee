import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;
        const data = await prisma.nilaiAkademikSiswa.findMany({
            where: { userId },
            orderBy: { pelajaran: "asc" },
            select: { id: true, pelajaran: true, nilai: true },
        });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("GET /nilai-akademik/siswa/[userId] error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
