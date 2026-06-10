import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.universitas.findMany({
            orderBy: { nama: "asc" },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET /api/universitas error:", error);
        return NextResponse.json({ error: "Gagal mengambil data universitas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nama, lokasi, keterangan } = body;

        if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
            return NextResponse.json({ error: "Nama universitas wajib diisi (min. 3 karakter)" }, { status: 400 });
        }

        const created = await prisma.universitas.create({
            data: {
                nama: nama.trim(),
                lokasi: lokasi?.trim() || null,
                keterangan: keterangan?.trim() || null,
            },
        });

        return NextResponse.json({ success: true, data: created });
    } catch (error) {
        console.error("POST /api/universitas error:", error);
        return NextResponse.json({ error: "Gagal menyimpan universitas" }, { status: 500 });
    }
}
