import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ success: false, error: "userId tidak ditemukan" }, { status: 400 });
  }

  const data = await prisma.tesMinatSiswa.findMany({
    where: { userId },
    select: { tipe: true },
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, tipe } = body;

  if (!userId || !tipe) {
    return NextResponse.json({ error: "userId dan tipe wajib diisi" }, { status: 400 });
  }

  // tipe bisa berupa array atau string
  const tipeString = Array.isArray(tipe) ? tipe.join(",") : tipe;

  const existing = await prisma.tesMinatSiswa.findFirst({
    where: { userId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Tes minat untuk siswa ini sudah ada." },
      { status: 400 }
    );
  }

  const result = await prisma.tesMinatSiswa.create({
    data: {
      userId,
      tipe: tipeString,
    },
  });

  return NextResponse.json({ success: true, data: result });
}
