// app/api/nilai-akademik/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.nilaiAkademikSiswa.findMany({
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: [{ user: { name: "asc" } }, { pelajaran: "asc" }],
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("GET /nilai-akademik error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, nilaiList } = await req.json();

        if (!userId || !Array.isArray(nilaiList)) {
            return NextResponse.json({ success: false, message: "Data tidak valid" }, { status: 400 });
        }

        // Hapus dulu semua nilai sebelumnya (opsional, bisa diubah jadi upsert)
        await prisma.nilaiAkademikSiswa.deleteMany({ where: { userId } });

        // Simpan nilai-nilai baru
        const result = await prisma.nilaiAkademikSiswa.createMany({
            data: nilaiList.map((n) => ({
                userId,
                pelajaran: n.pelajaran,
                nilai: n.nilai,
            })),
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("POST /api/nilai-akademik error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
