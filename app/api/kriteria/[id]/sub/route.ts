import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/")[4]; // /api/kriteria/[id]/sub

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
  }

  try {
    const subs = await prisma.subKriteria.findMany({
      where: { kriteriaId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: subs });
  } catch (err) {
    console.error("Error fetching sub kriteria:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
  }
}
