import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const kriteria = await prisma.kriteria.findMany({
            include: {
                subKriteria: {
                    orderBy: { bobot_sub_kriteria: "desc" },
                    select: {
                        id: true,
                        nama_sub_kriteria: true,
                        bobot_sub_kriteria: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        const formatted = kriteria.map((k) => ({
            id: k.id,
            nama_kriteria: k.nama_kriteria,
            subKriteria: k.subKriteria.map((s) => ({
                value: s.id,
                label: `${s.nama_sub_kriteria} (Bobot: ${s.bobot_sub_kriteria})`,
            })),
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("GET /kriteria-with-sub error:", error);
        return NextResponse.json({ error: "Gagal mengambil data kriteria" }, { status: 500 });
    }
}
