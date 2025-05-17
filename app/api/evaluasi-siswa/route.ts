import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
    try {
        const siswaList = await prisma.user.findMany({
            where: { role: "SISWA" },
            orderBy: { name: "asc" },
            include: {
                evaluasi: {
                    include: {
                        kriteria: { select: { id: true, nama_kriteria: true } },
                        subKriteria: {
                            select: { nama_sub_kriteria: true, bobot_sub_kriteria: true },
                        },
                    },
                },
                tesMinat: {
                    select: { tipe: true },
                },
            },
        });

        const result = siswaList.map((siswa) => ({
            id: siswa.id,
            nama: siswa.name,
            penilaian: siswa.evaluasi.map((ev) => ({
                kriteria: {
                    id: ev.kriteria.id,
                    nama_kriteria: ev.kriteria.nama_kriteria,
                },
                subKriteria: {
                    nama_sub_kriteria: ev.subKriteria.nama_sub_kriteria,
                    bobot_sub_kriteria: ev.subKriteria.bobot_sub_kriteria,
                },
            })),
            riasec: siswa.tesMinat.map((t) => t.tipe), // tambah field RIASEC
        }));


        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("GET /api/evaluasi-siswa error:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mengambil data evaluasi" },
            { status: 500 }
        );
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, evaluations } = body;

        if (!userId || !Array.isArray(evaluations)) {
            return NextResponse.json(
                { error: "Data tidak valid" },
                { status: 400 }
            );
        }

        // Cek apakah user sudah punya evaluasi
        const existing = await prisma.evaluasiKriteria.findFirst({
            where: { userId },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Siswa ini sudah memiliki evaluasi. Tidak dapat menambahkan lagi." },
                { status: 409 } // Conflict
            );
        }

        // Simpan evaluasi baru
        const created = await prisma.evaluasiKriteria.createMany({
            data: evaluations.map((ev: { kriteriaId: string; subKriteriaId: string; programStudiId: string }) => ({
                userId,
                kriteriaId: ev.kriteriaId,
                subKriteriaId: ev.subKriteriaId,
                programStudiId: ev.programStudiId,
            })),
        });

        return NextResponse.json({ success: true, inserted: created.count });
    } catch (error) {
        console.error("POST /evaluasi-kriteria error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}       
