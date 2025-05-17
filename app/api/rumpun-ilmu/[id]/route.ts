import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper untuk ambil id dari URL
const getIdFromPath = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

export async function GET(req: NextRequest) {
    const id = getIdFromPath(req);

    if (!id) {
        return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    try {
        const data = await prisma.rumpunIlmu.findUnique({
            where: { id },
        });

        if (!data) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET BY ID /api/rumpun-ilmu:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const id = getIdFromPath(req);

    if (!id) {
        return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const data = await prisma.rumpunIlmu.update({
            where: { id },
            data: { nama: body.nama },
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("PUT /api/rumpun-ilmu:", error);
        return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = getIdFromPath(req);

    if (!id) {
        return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    try {
        await prisma.rumpunIlmu.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/rumpun-ilmu:", error);
        return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
    }
}
