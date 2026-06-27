import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/utils/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.hasilPerhitungan.findMany({
    where: { userId: user.id },
    include: {
      programStudi: {
        select: {
          id: true,
          nama_program_studi: true,
          universitas: { select: { nama: true } },
        },
      },
      kriteria: { select: { id: true, nama_kriteria: true, bobot_kriteria: true } },
      subKriteria: { select: { id: true, nama_sub_kriteria: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (rows.length === 0) {
    return NextResponse.json({ data: [], details: [], savedAt: null, programStudiIds: [] });
  }

  // Build a stable key per program (handle null programStudiId for deleted prodi)
  const programMeta = new Map<string, { id: string; nama: string; universitas_nama: string | null }>();
  rows.forEach((r) => {
    const key = r.programStudiId ?? `__deleted__${r.programStudiNama ?? ""}`;
    if (!programMeta.has(key)) {
      programMeta.set(key, {
        id: r.programStudiId ?? key,
        nama: r.programStudi?.nama_program_studi ?? r.programStudiNama ?? "Program Studi Dihapus",
        universitas_nama: r.programStudi?.universitas?.nama ?? null,
      });
    }
  });

  const programKeys = [...programMeta.keys()];
  const criteriaIds = [...new Set(rows.map((r) => r.kriteriaId))].sort();
  const n = programKeys.length;
  const k = criteriaIds.length;

  // matrix[i][c] = nilai for program i on criterion c
  const matrix = programKeys.map((key) => {
    const items = rows.filter((r) => (r.programStudiId ?? `__deleted__${r.programStudiNama ?? ""}`) === key);
    return criteriaIds.map((cid) => {
      const item = items.find((r) => r.kriteriaId === cid);
      return item?.nilai ?? 0;
    });
  });

  const phiPlus = new Array(n).fill(0);
  const phiMinus = new Array(n).fill(0);

  if (n > 1) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        let pi_ij = 0;
        for (let c = 0; c < k; c++) {
          const d = matrix[i][c] - matrix[j][c];
          pi_ij += d > 0 ? 1 : 0;
        }
        pi_ij = k > 0 ? pi_ij / k : 0;
        phiPlus[i] += pi_ij;
        phiMinus[j] += pi_ij;
      }
    }
    for (let i = 0; i < n; i++) {
      phiPlus[i] /= n - 1;
      phiMinus[i] /= n - 1;
    }
  }

  // Sort indices by descending net flow
  const sortedIndices = programKeys
    .map((_, i) => i)
    .sort((a, b) => (phiPlus[b] - phiMinus[b]) - (phiPlus[a] - phiMinus[a]));

  const data = sortedIndices.map((i) => {
    const meta = programMeta.get(programKeys[i])!;
    const netFlow = phiPlus[i] - phiMinus[i];
    return {
      programStudiId: meta.id,
      nama: meta.nama,
      universitas_nama: meta.universitas_nama,
      netFlow: Number.isFinite(netFlow) ? netFlow : 0,
      leavingFlow: Number.isFinite(phiPlus[i]) ? phiPlus[i] : 0,
      enteringFlow: Number.isFinite(phiMinus[i]) ? phiMinus[i] : 0,
    };
  });

  const details = sortedIndices.map((i) => {
    const key = programKeys[i];
    const meta = programMeta.get(key)!;
    const netFlow = phiPlus[i] - phiMinus[i];
    const items = rows.filter((r) => (r.programStudiId ?? `__deleted__${r.programStudiNama ?? ""}`) === key);
    return {
      programStudiId: meta.id,
      nama: meta.nama,
      universitas_nama: meta.universitas_nama,
      criteria: items.map((r) => ({
        name: r.kriteria.nama_kriteria,
        value: r.nilai,
        weight: r.kriteria.bobot_kriteria,
        subName: r.subKriteria.nama_sub_kriteria,
        kriteriaId: r.kriteriaId,
        subKriteriaId: r.subKriteriaId,
      })),
      leavingFlow: Number.isFinite(phiPlus[i]) ? phiPlus[i] : 0,
      enteringFlow: Number.isFinite(phiMinus[i]) ? phiMinus[i] : 0,
      netFlow: Number.isFinite(netFlow) ? netFlow : 0,
    };
  });

  return NextResponse.json({
    data,
    details,
    savedAt: rows[rows.length - 1]?.createdAt ?? null,
    programStudiIds: sortedIndices.map((i) => programMeta.get(programKeys[i])!.id),
  });
}
