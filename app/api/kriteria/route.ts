import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const data = await prisma.kriteria.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama_kriteria, bobot_kriteria, keterangan } = body;

    if (!nama_kriteria) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    const created = await prisma.kriteria.create({
      data: {
        nama_kriteria,
        bobot_kriteria,
        keterangan,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("POST /kriteria error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
