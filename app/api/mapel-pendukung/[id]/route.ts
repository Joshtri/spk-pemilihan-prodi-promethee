// app/api/mapel-pendukung/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { programStudiId, nama_mata_pelajaran } = body;

        const updated = await prisma.mataPelajaranPendukung.update({
            where: { id },
            data: {
                programStudiId,
                nama_mata_pelajaran,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("PUT /api/mapel-pendukung/[id] error:", error);
        return NextResponse.json({ success: false, message: "Gagal update data" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        await prisma.mataPelajaranPendukung.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/mapel-pendukung/[id] error:", error);
        return NextResponse.json({ success: false, message: "Gagal hapus data" }, { status: 500 });
    }
}
