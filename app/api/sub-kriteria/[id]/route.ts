import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const getIdFromPath = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

export async function PUT(req: NextRequest) {
    const id = getIdFromPath(req);
    if (!id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { kriteriaId, nama_sub_kriteria, bobot_sub_kriteria } = body;

        if (!kriteriaId || !nama_sub_kriteria || typeof bobot_sub_kriteria !== "number") {
            return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
        }

        const updated = await prisma.subKriteria.update({
            where: { id },
            data: {
                kriteriaId,
                nama_sub_kriteria,
                bobot_sub_kriteria,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("PUT /sub-kriteria/[id] error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = getIdFromPath(req);
    if (!id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    try {
        // Check if referenced in calculation history
        const hasilCount = await prisma.hasilPerhitungan.count({
            where: { subKriteriaId: id },
        });

        if (hasilCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Sub kriteria ini telah digunakan dalam ${hasilCount} riwayat perhitungan dan tidak dapat dihapus karena data riwayat harus tetap terjaga.`,
                },
                { status: 400 }
            );
        }

        // Check if referenced in student evaluations
        const evaluasiCount = await prisma.evaluasiKriteria.count({
            where: { subKriteriaId: id },
        });

        if (evaluasiCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Sub kriteria ini telah digunakan dalam ${evaluasiCount} data evaluasi siswa dan tidak dapat dihapus.`,
                },
                { status: 400 }
            );
        }

        const deleted = await prisma.subKriteria.delete({ where: { id } });

        return NextResponse.json({ success: true, data: deleted });
    } catch (error) {
        console.error("DELETE /sub-kriteria/[id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghapus sub kriteria" },
            { status: 500 }
        );
    }
}
