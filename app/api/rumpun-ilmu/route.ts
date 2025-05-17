import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.rumpunIlmu.findMany({
            include: {
                programStudi: {
                    select: {
                        id: true,
                        nama_program_studi: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET /api/rumpun-ilmu error:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data rumpun ilmu" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nama } = body;

        if (!nama || typeof nama !== "string" || nama.length > 100) {
            return NextResponse.json(
                { success: false, message: "Input nama tidak valid" },
                { status: 400 }
            );
        }

        const created = await prisma.rumpunIlmu.create({
            data: {
                nama,
            },
        });

        return NextResponse.json({ success: true, data: created });
    } catch (error) {
        console.error("POST /api/rumpun-ilmu error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}