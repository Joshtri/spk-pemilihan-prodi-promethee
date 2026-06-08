import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Ambil semua prodi dengan mapel pendukungnya
const prodiList = await prisma.programStudi.findMany({
  include: { mataPelajaranPendukung: true, riasec: true },
  orderBy: { nama_program_studi: "asc" },
});

console.log("=== PROGRAM STUDI & MAPEL PENDUKUNG ===\n");
for (const ps of prodiList) {
  console.log(`▶ ${ps.nama_program_studi} (biaya=${ps.biaya_kuliah.toLocaleString("id-ID")}, akreditasi=${ps.akreditasi})`);
  const riasec = ps.riasec.map((r) => r.tipeRiasec).join(", ");
  console.log(`  RIASEC: ${riasec}`);
  if (ps.mataPelajaranPendukung.length === 0) {
    console.log("  ⚠️  Tidak ada mapel pendukung!");
  } else {
    for (const m of ps.mataPelajaranPendukung) {
      console.log(`  • ${m.nama_mata_pelajaran}`);
    }
  }
  console.log();
}

await prisma.$disconnect();
