import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { kriteriaId, nama_sub_kriteria, bobot_sub_kriteria } = body;

        if (!kriteriaId || !nama_sub_kriteria || typeof bobot_sub_kriteria !== "number") {
            return NextResponse.json(
                { success: false, message: "Input tidak valid" },
                { status: 400 }
            );
        }

        const created = await prisma.subKriteria.create({
            data: {
                kriteriaId,
                nama_sub_kriteria,
                keterangan: "",
                bobot_sub_kriteria,
            },
        });

        return NextResponse.json({ success: true, data: created });
    } catch (error) {
        console.error("POST /sub-kriteria error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menyimpan sub-kriteria" },
            { status: 500 }
        );
    }
}



export async function GET() {
    try {
      const data = await prisma.subKriteria.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          kriteria: true, // JOIN ke model Kriteria
        },
      });
  
      return NextResponse.json({ success: true, data });
    } catch (err) {
      console.error("GET /sub-kriteria error:", err);
      return NextResponse.json({ success: false, message: "Gagal memuat data" }, { status: 500 });
    }
  }
  