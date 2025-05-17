import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { nilai } = await req.json();
        const updated = await prisma.nilaiAkademikSiswa.update({
            where: { id: params.id },
            data: { nilai: parseInt(nilai) },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (err) {
        console.error("PUT /nilai-akademik error", err);
        return NextResponse.json({ success: false, message: "Gagal update nilai" }, { status: 500 });
    }
}



export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.nilaiAkademikSiswa.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE /nilai-akademik error", err);
        return NextResponse.json({ success: false, message: "Gagal hapus nilai" }, { status: 500 });
    }
}
