import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/kriteria/[id]
export async function GET(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop(); // ambil [id] dari path

    if (!id) {
        return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const item = await prisma.kriteria.findUnique({
        where: { id },
    });

    if (!item) {
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
}

// PUT /api/kriteria/[id]
export async function PUT(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
        return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { nama_kriteria, bobot_kriteria, keterangan } = body;

        const updated = await prisma.kriteria.update({
            where: { id },
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

// DELETE /api/kriteria/[id]
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
        return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    try {
        await prisma.kriteria.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("DELETE /kriteria/[id] error:", error);
        return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
    }
}
