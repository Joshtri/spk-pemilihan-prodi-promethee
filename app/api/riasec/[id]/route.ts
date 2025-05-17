import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Utility: ambil ID dari URL
const getIdFromPath = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

export async function GET(req: NextRequest) {
    const id = getIdFromPath(req);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        const data = await prisma.programStudiRiasec.findUnique({
            where: { id },
        });

        if (!data) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET /riasec/[id] error:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const id = getIdFromPath(req);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        const body = await req.json();
        const { programStudiId, tipeRiasec } = body;

        if (!programStudiId || !tipeRiasec) {
            return NextResponse.json(
                { error: "Program studi dan tipe RIASEC harus diisi" },
                { status: 400 }
            );
        }

        const existing = await prisma.programStudiRiasec.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Mapping tidak ditemukan" }, { status: 404 });
        }

        const duplicate = await prisma.programStudiRiasec.findFirst({
            where: {
                programStudiId,
                tipeRiasec,
                NOT: { id },
            },
        });

        if (duplicate) {
            return NextResponse.json({ error: "Mapping ini sudah ada" }, { status: 409 });
        }

        const result = await prisma.programStudiRiasec.update({
            where: { id },
            data: { programStudiId, tipeRiasec },
            include: { programStudi: true },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: result.id,
                programStudiId: result.programStudiId,
                programStudi: result.programStudi.nama_program_studi,
                tipeRiasec: result.tipeRiasec,
            },
        });
    } catch (error) {
        console.error("PUT RIASEC error:", error);
        return NextResponse.json({ error: "Gagal memperbarui data mapping RIASEC" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = getIdFromPath(req);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        await prisma.programStudiRiasec.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /riasec/[id] error:", error);
        return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
    }
}
