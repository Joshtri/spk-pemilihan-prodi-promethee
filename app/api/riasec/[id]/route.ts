import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
    params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
    try {
        const data = await prisma.programStudiRiasec.findUnique({
            where: { id: params.id },
        });

        if (!data) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("GET /riasec/[id] error:", errorMessage);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}
// PUT - Update existing mapping
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();

        if (!body.programStudiId || !body.tipeRiasec) {
            return NextResponse.json(
                { error: "Program studi dan tipe RIASEC harus diisi" },
                { status: 400 }
            );
        }

        // Check if mapping exists
        const existing = await prisma.programStudiRiasec.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Mapping tidak ditemukan" },
                { status: 404 }
            );
        }

        // Check if new mapping already exists
        const duplicate = await prisma.programStudiRiasec.findFirst({
            where: {
                programStudiId: body.programStudiId,
                tipeRiasec: body.tipeRiasec,
                NOT: { id },
            },
        });

        if (duplicate) {
            return NextResponse.json(
                { error: "Mapping ini sudah ada" },
                { status: 409 }
            );
        }

        // Update mapping
        const result = await prisma.programStudiRiasec.update({
            where: { id },
            data: {
                programStudiId: body.programStudiId,
                tipeRiasec: body.tipeRiasec,
            },
            include: {
                programStudi: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: result.id,
                programStudiId: result.programStudiId,
                programStudi: result.programStudi.nama_program_studi,
                tipeRiasec: result.tipeRiasec,
            }
        });

    } catch (error) {
        console.error("PUT RIASEC error:", error);
        return NextResponse.json(
            { error: "Gagal memperbarui data mapping RIASEC" },
            { status: 500 }
        );
    }
}
export async function DELETE(req: Request, { params }: Params) {
    try {
        await prisma.programStudiRiasec.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("DELETE /riasec/[id] error:", errorMessage);
        return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
    }
}
