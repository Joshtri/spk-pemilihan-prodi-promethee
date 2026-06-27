import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const extractId = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

export async function GET(req: NextRequest) {
    const id = extractId(req);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        const data = await prisma.universitas.findUnique({ where: { id } });
        if (!data) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        return NextResponse.json({ data });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const id = extractId(req);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        const body = await req.json();
        const { nama, lokasi, keterangan } = body;

        if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
            return NextResponse.json({ error: "Nama universitas wajib diisi (min. 3 karakter)" }, { status: 400 });
        }

        const updated = await prisma.universitas.update({
            where: { id },
            data: {
                nama: nama.trim(),
                lokasi: lokasi?.trim() || null,
                keterangan: keterangan?.trim() || null,
                updatedAt: new Date(),
            },
        });
        return NextResponse.json({ data: updated });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = extractId(req);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        const prodiCount = await prisma.programStudi.count({
            where: { universitasId: id },
        });

        if (prodiCount > 0) {
            return NextResponse.json(
                {
                    error: "Universitas masih memiliki program studi",
                    message: `Universitas ini memiliki ${prodiCount} program studi. Hapus atau pindahkan program studi tersebut terlebih dahulu.`,
                },
                { status: 400 }
            );
        }

        await prisma.universitas.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg, message: "Gagal menghapus universitas" }, { status: 500 });
    }
}
