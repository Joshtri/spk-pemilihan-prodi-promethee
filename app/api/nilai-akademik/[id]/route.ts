import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/nilai-akademik/[id]
export async function PUT(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop(); // ambil ID dari URL

    if (!id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    try {
        const { nilai } = await req.json();

        const updated = await prisma.nilaiAkademikSiswa.update({
            where: { id },
            data: { nilai: parseInt(nilai) },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (err) {
        console.error("PUT /nilai-akademik error", err);
        return NextResponse.json({ success: false, message: "Gagal update nilai" }, { status: 500 });
    }
}

// DELETE /api/nilai-akademik/[id]
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    try {
        await prisma.nilaiAkademikSiswa.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE /nilai-akademik error", err);
        return NextResponse.json({ success: false, message: "Gagal hapus nilai" }, { status: 500 });
    }
}
