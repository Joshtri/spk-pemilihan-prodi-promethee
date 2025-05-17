// app/api/mapel-pendukung/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Ambil semua data
export async function GET() {
    try {
        const data = await prisma.mataPelajaranPendukung.findMany({
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

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("GET /api/mapel-pendukung error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

// POST: Tambah data baru
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { programStudiId, nama_mata_pelajaran } = body;

        if (!programStudiId || !nama_mata_pelajaran) {
            return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
        }

        const created = await prisma.mataPelajaranPendukung.create({
            data: {
                programStudiId,
                nama_mata_pelajaran,
            },
        });

        return NextResponse.json({ success: true, data: created });
    } catch (error) {
        console.error("POST /api/mapel-pendukung error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
