// app/api/mapel-pendukung/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ PUT /api/mapel-pendukung/[id]
export async function PUT(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    try {
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

// ✅ DELETE /api/mapel-pendukung/[id]
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    try {
        await prisma.mataPelajaranPendukung.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/mapel-pendukung/[id] error:", error);
        return NextResponse.json({ success: false, message: "Gagal hapus data" }, { status: 500 });
    }
}
