// lib/promethee/promethee-engine.ts
import prisma  from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Fungsi utama: Hitung peringkat PROMETHEE untuk siswa berdasarkan pilihan program studi mereka
 */
export async function runPromethee(userId: string) {
  const programStudiDipilih = await prisma.pilihanProgramStudi.findMany({
    where: { userId },
    select: { programStudiId: true },
  });

  const programIds = programStudiDipilih.map((p) => p.programStudiId);

  const kriteriaList = await prisma.kriteria.findMany({
    include: { subKriteria: true },
  });

  const nilaiAkademik = await prisma.nilaiAkademikSiswa.findMany({
    where: { userId },
  });

  const tesMinat = await prisma.tesMinatSiswa.findMany({ where: { userId } });

  // Step 1: Generate EvaluasiKriteria untuk setiap program studi yang dipilih
  for (const programId of programIds) {
    for (const kriteria of kriteriaList) {
      let sub: any = null;

      if (kriteria.nama_kriteria.includes("minat")) {
        const cocok = tesMinat.find((t) =>
          kriteria.keterangan?.includes(t.tipe)
        );
        if (cocok) {
          sub = kriteria.subKriteria.find((s) =>
            s.nama_sub_kriteria.includes(t.tipe)
          );
        }
      } else if (kriteria.nama_kriteria.includes("biaya")) {
        const biaya = (
          await prisma.programStudi.findUnique({ where: { id: programId } })
        )?.biaya_kuliah;
        sub = kriteria.subKriteria.find(
          (s) => parseInt(s.keterangan || "0") >= biaya
        );
      } else if (kriteria.nama_kriteria.includes("akreditasi")) {
        const akreditasi = (
          await prisma.programStudi.findUnique({ where: { id: programId } })
        )?.akreditasi;
        sub = kriteria.subKriteria.find((s) =>
          s.nama_sub_kriteria.includes(akreditasi || "")
        );
      } else {
        // kriteria akademik (berdasarkan mata pelajaran pendukung)
        const mapelPendukung = await prisma.mataPelajaranPendukung.findMany({
          where: { programStudiId: programId },
        });

        const nilaiRata = mapelPendukung
          .map((m) => nilaiAkademik.find((n) => n.pelajaran === m.nama_mata_pelajaran)?.nilai || 0)
          .reduce((a, b, _, arr) => a + b / arr.length, 0);

        sub = kriteria.subKriteria
          .filter((s) => s.keterangan)
          .sort((a, b) => (a.bobot_sub_kriteria > b.bobot_sub_kriteria ? -1 : 1))
          .find((s) => nilaiRata >= parseFloat(s.keterangan!));
      }

      if (sub) {
        await prisma.evaluasiKriteria.upsert({
          where: {
            userId_programStudiId_kriteriaId: {
              userId,
              programStudiId: programId,
              kriteriaId: kriteria.id,
            },
          },
          create: {
            id: uuidv4(),
            userId,
            programStudiId: programId,
            kriteriaId: kriteria.id,
            subKriteriaId: sub.id,
          },
          update: { subKriteriaId: sub.id },
        });
      }
    }
  }

  // Step 2: Ambil kembali hasil evaluasi untuk perhitungan PROMETHEE
  const evaluasi = await prisma.evaluasiKriteria.findMany({
    where: { userId },
    include: { subKriteria: true, kriteria: true },
  });

  // Step 3: Hitung preferensi antar alternatif
  const preferensi: Record<string, Record<string, number>> = {}; // A vs B = score

  for (const A of programIds) {
    preferensi[A] = {};
    for (const B of programIds) {
      if (A === B) continue;
      let total = 0;
      for (const k of kriteriaList) {
        const evaA = evaluasi.find((e) => e.programStudiId === A && e.kriteriaId === k.id);
        const evaB = evaluasi.find((e) => e.programStudiId === B && e.kriteriaId === k.id);

        if (!evaA || !evaB) continue;
        const diff = evaA.subKriteria.bobot_sub_kriteria - evaB.subKriteria.bobot_sub_kriteria;
        const p = diff > 0 ? 1 : diff < 0 ? 0 : 0.5;
        total += p * k.bobot_kriteria;
      }
      preferensi[A][B] = total;
    }
  }

  // Step 4: Hitung net flow dan simpan
  for (const A of programIds) {
    const leaving = programIds.filter((b) => b !== A).reduce((sum, B) => sum + (preferensi[A]?.[B] || 0), 0) / (programIds.length - 1);
    const entering = programIds.filter((b) => b !== A).reduce((sum, B) => sum + (preferensi[B]?.[A] || 0), 0) / (programIds.length - 1);
    const netFlow = leaving - entering;

    await prisma.hasilPerhitungan.upsert({
      where: {
        userId_programStudiId_kriteriaId: {
          userId,
          programStudiId: A,
          kriteriaId: "PROMETHEE",
        },
      },
      create: {
        id: uuidv4(),
        userId,
        programStudiId: A,
        kriteriaId: "PROMETHEE",
        subKriteriaId: "-",
        nilai: netFlow,
      },
      update: { nilai: netFlow },
    });
  }
}
