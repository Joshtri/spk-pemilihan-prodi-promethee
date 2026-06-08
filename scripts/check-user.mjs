import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const userId = "c47ea5ea-bfd1-4365-bfe5-38e6d455917b";

const [user, nilaiAkademik, tesMinat, pilihan, hasil, evaluasi] = await Promise.all([
  prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, role: true } }),
  prisma.nilaiAkademikSiswa.findMany({ where: { userId } }),
  prisma.tesMinatSiswa.findMany({ where: { userId } }),
  prisma.pilihanProgramStudi.findMany({ where: { userId }, include: { programStudi: true } }),
  prisma.hasilPerhitungan.findMany({ where: { userId }, include: { programStudi: { select: { nama_program_studi: true } } } }),
  prisma.evaluasiKriteria.findMany({ where: { userId }, include: { kriteria: true, subKriteria: true, programStudi: { select: { nama_program_studi: true } } } }),
]);

console.log("=== USER ===");
console.log(user ?? "NOT FOUND");

console.log("\n=== NILAI AKADEMIK (" + nilaiAkademik.length + ") ===");
nilaiAkademik.forEach(n => console.log(" ", n.pelajaran.padEnd(45), "=", n.nilai));

console.log("\n=== TES MINAT (" + tesMinat.length + ") ===");
tesMinat.forEach(t => console.log(" ", t.tipe));

console.log("\n=== PILIHAN PRODI (" + pilihan.length + ") ===");
pilihan.forEach(p => console.log(" ", p.programStudi?.nama_program_studi));

console.log("\n=== HASIL PERHITUNGAN (" + hasil.length + ") ===");
hasil.forEach(h => console.log(" ", (h.programStudi?.nama_program_studi ?? h.programStudiId).padEnd(35), "nilai=", h.nilai));

console.log("\n=== EVALUASI KRITERIA (" + evaluasi.length + ") ===");
evaluasi.forEach(e => console.log(
  " ", (e.programStudi?.nama_program_studi ?? "?").padEnd(25),
  e.kriteria.nama_kriteria.padEnd(30),
  e.subKriteria.nama_sub_kriteria.padEnd(20),
  "bobot=", e.subKriteria.bobot_sub_kriteria
));

await prisma.$disconnect();
