import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    const item = await prisma.kriteria.findUnique({
        where: { id: params.id },
    });

    if (!item) {
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { nama_kriteria, bobot_kriteria, keterangan } = body;

        const updated = await prisma.kriteria.update({
            where: { id: params.id },
            data: {
                nama_kriteria,
                bobot_kriteria,
                keterangan,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("PUT /kriteria/[id] error:", error);
        return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.kriteria.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("DELETE /kriteria/[id] error:", error);
        return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
    }
}
