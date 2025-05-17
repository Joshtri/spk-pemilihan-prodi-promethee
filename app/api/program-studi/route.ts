import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.programStudi.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET ProgramStudi error:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.nama_program_studi || !body.biaya_kuliah || !body.akreditasi) {
            return NextResponse.json(
                { error: "Nama program studi, biaya kuliah, dan akreditasi wajib diisi" },
                { status: 400 }
            );
        }

        // Convert biaya_kuliah to integer
        const biayaKuliah = Math.round(Number(body.biaya_kuliah));

        const result = await prisma.programStudi.create({
            data: {
                nama_program_studi: body.nama_program_studi,
                biaya_kuliah: biayaKuliah,
                akreditasi: body.akreditasi,
                keterangan: body.keterangan || null,
                rumpunIlmuId: body.rumpunIlmuId || null,
            },
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: unknown) {
        console.error("POST ProgramStudi error:", error);

        let errorMessage = "Gagal menyimpan program studi";
        let errorDetails = "Unknown error";

        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            errorMessage = "Nama program studi sudah digunakan";
        }

        if (error && typeof error === 'object' && 'message' in error) {
            errorDetails = error.message as string;
        }

        return NextResponse.json(
            { error: errorMessage, details: errorDetails },
            { status: 500 }
        );
    }
}