import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
    params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
    try {
        const data = await prisma.rumpunIlmu.findUnique({
            where: { id: params.id },
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

export async function PUT(req: Request, { params }: Params) {
    try {
        const body = await req.json();
        const data = await prisma.rumpunIlmu.update({
            where: { id: params.id },
            data: {
                nama: body.nama,
            },
        });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("PUT /api/rumpun-ilmu:", error);
        return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: Params) {
    try {
        await prisma.rumpunIlmu.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/rumpun-ilmu:", error);
        return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
    }
}
