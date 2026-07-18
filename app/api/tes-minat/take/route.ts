import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/utils/auth";

const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const;

function calculateResult(jawaban: boolean[]) {
  const scores: Record<string, number> = {};
  RIASEC_ORDER.forEach((type, i) => {
    const yesCount = jawaban.slice(i * 5, i * 5 + 5).filter(Boolean).length;
    scores[type] = yesCount * 5;
  });

  const sorted = [...RIASEC_ORDER].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b);
  });

  return { scores, top3: sorted.slice(0, 3) };
}

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.tesMinatSiswa.findFirst({
    where: { userId: user.id },
    select: { id: true, tipe: true, jawaban: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jawaban } = body;

  if (!Array.isArray(jawaban) || jawaban.length !== 30) {
    return NextResponse.json({ error: "jawaban harus berisi tepat 30 item" }, { status: 400 });
  }

  const { scores, top3 } = calculateResult(jawaban as boolean[]);
  const tipe = top3.join(",");

  const existing = await prisma.tesMinatSiswa.findFirst({ where: { userId: user.id } });

  const result = existing
    ? await prisma.tesMinatSiswa.update({
        where: { id: existing.id },
        data: { tipe, jawaban },
      })
    : await prisma.tesMinatSiswa.create({
        data: { userId: user.id, tipe, jawaban },
      });

  return NextResponse.json({ success: true, data: result, scores, top3 });
}
