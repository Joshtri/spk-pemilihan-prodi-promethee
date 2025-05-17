import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
    params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
    try {
        const data = await prisma.programStudi.findUnique({
            where: { id: params.id },
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

export async function DELETE(req: Request, { params }: Params) {
    try {
        await prisma.programStudi.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json({ errorMessage }, { status: 500 });
    }
}


export async function PUT(req: Request, { params }: Params) {
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
            where: { id: params.id },
            data: {
                nama_program_studi,
                biaya_kuliah,
                akreditasi,
                keterangan,
                rumpunIlmuId,
                updatedAt: new Date(), // tidak wajib, Prisma akan otomatis handle @updatedAt
            },
        });

        return NextResponse.json({ data: updated });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ errorMessage }, { status: 500 });
    }
}
