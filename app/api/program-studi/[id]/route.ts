import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Ambil ID dari URL
const extractId = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

export async function GET(req: NextRequest) {
    const id = extractId(req);

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        const data = await prisma.programStudi.findUnique({
            where: { id },
        });

        if (!data) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = extractId(req);

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        await prisma.programStudi.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ errorMessage }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const id = extractId(req);

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const {
            nama_program_studi,
            biaya_kuliah,
            akreditasi,
            keterangan,
            rumpunIlmuId,
        } = body;

        const updated = await prisma.programStudi.update({
            where: { id },
            data: {
                nama_program_studi,
                biaya_kuliah,
                akreditasi,
                keterangan,
                rumpunIlmuId,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ data: updated });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ errorMessage }, { status: 500 });
    }
}
