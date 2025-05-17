import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/utils/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getUserFromCookie();

    if (!user || !user.id) {
      return NextResponse.json(
        { logs: [], message: "Unauthorized" },
        { status: 401 }
      );
    }

    const logs = await prisma.log.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 50, // ambil 50 log terakhir
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (err) {
    console.error("Error fetching logs:", err);
    return NextResponse.json(
      { logs: [], message: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
