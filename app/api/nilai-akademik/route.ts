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

        // Ambil data yang sudah ada untuk user ini
        const existing = await prisma.nilaiAkademikSiswa.findMany({ where: { userId } });
        const existingMap = new Map(existing.map((e) => [e.pelajaran, e.id]));

        // Upsert: update jika sudah ada, create jika belum
        await prisma.$transaction([
            ...nilaiList
                .filter((n: { pelajaran: string; nilai: number }) => existingMap.has(n.pelajaran))
                .map((n: { pelajaran: string; nilai: number }) =>
                    prisma.nilaiAkademikSiswa.update({
                        where: { id: existingMap.get(n.pelajaran)! },
                        data: { nilai: n.nilai },
                    })
                ),
            ...nilaiList
                .filter((n: { pelajaran: string; nilai: number }) => !existingMap.has(n.pelajaran))
                .map((n: { pelajaran: string; nilai: number }) =>
                    prisma.nilaiAkademikSiswa.create({
                        data: { userId, pelajaran: n.pelajaran, nilai: n.nilai },
                    })
                ),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/nilai-akademik error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
