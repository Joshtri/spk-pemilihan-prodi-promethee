import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/kriteria/[id]
export async function GET(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/").pop();

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
        const kriteria = await prisma.kriteria.findUnique({
            where: { id },
            include: { _count: { select: { subKriteria: true } } },
        });

        if (!kriteria) {
            return NextResponse.json({ success: false, message: "Kriteria tidak ditemukan" }, { status: 404 });
        }

        if (kriteria.isDefault) {
            return NextResponse.json(
                { success: false, message: "Kriteria ini adalah kriteria default sistem dan tidak dapat dihapus." },
                { status: 403 }
            );
        }

        if (kriteria._count.subKriteria > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Kriteria ini memiliki ${kriteria._count.subKriteria} sub kriteria. Hapus sub kriteria terlebih dahulu sebelum menghapus kriteria ini.`,
                },
                { status: 400 }
            );
        }

        await prisma.kriteria.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Kriteria berhasil dihapus" });
    } catch (error) {
        console.error("DELETE /kriteria/[id] error:", error);
        return NextResponse.json({ success: false, message: "Gagal menghapus kriteria" }, { status: 500 });
    }
}
