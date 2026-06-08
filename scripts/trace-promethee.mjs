/**
 * Trace PROMETHEE step-by-step untuk user c47ea5ea-bfd1-4365-bfe5-38e6d455917b
 * Jalankan: node scripts/trace-promethee.mjs
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const TARGET_USER = "c47ea5ea-bfd1-4365-bfe5-38e6d455917b";

function sortedSubs(subKriteriaList, kriteriaId) {
  return subKriteriaList
    .filter((s) => s.kriteriaId === kriteriaId)
    .sort((a, b) => b.bobot_sub_kriteria - a.bobot_sub_kriteria);
}
function fmt(n) { return n.toFixed(4); }
function line(len = 80) { return "─".repeat(len); }

const userId = TARGET_USER;

// Ambil program studi yang pernah dihitung (dari hasilPerhitungan)
const hasilRaw = await prisma.hasilPerhitungan.findMany({
  where: { userId },
  include: {
    programStudi: { include: { mataPelajaranPendukung: true, riasec: true } },
    kriteria: true,
    subKriteria: true,
  },
});

if (hasilRaw.length === 0) {
  console.log("❌ Tidak ada data hasil perhitungan untuk user ini");
  await prisma.$disconnect();
  process.exit(1);
}

// Deduplicate program studi
const prodiMap = new Map();
for (const h of hasilRaw) {
  if (!prodiMap.has(h.programStudiId)) prodiMap.set(h.programStudiId, h.programStudi);
}
const programList = [...prodiMap.values()];
const programIds  = [...prodiMap.keys()];

const nilaiAkademik = await prisma.nilaiAkademikSiswa.findMany({ where: { userId } });
const tesMinat      = await prisma.tesMinatSiswa.findMany({ where: { userId } });
const kriteriaList  = await prisma.kriteria.findMany({ include: { subKriteria: true } });
const subKriteriaList = await prisma.subKriteria.findMany();

const minatK      = kriteriaList.find((k) => k.nama_kriteria === "Minat");
const akademikK   = kriteriaList.find((k) => k.nama_kriteria === "Nilai Akademik");
const biayaK      = kriteriaList.find((k) => k.nama_kriteria === "Biaya Kuliah");
const akreditasiK = kriteriaList.find((k) => k.nama_kriteria === "Akreditasi Program Studi");

const tesMinatTypes = tesMinat.flatMap((t) =>
  t.tipe.split(",").map((x) => x.trim().toUpperCase())
);

console.log(line());
console.log("PROMETHEE TRACE — userId:", userId);
console.log(line());

// ─── Kriteria ──────────────────────────────────────────────────────────────
console.log("\n[1] KRITERIA & BOBOT SUB-KRITERIA");
for (const k of kriteriaList) {
  console.log(`  ${k.nama_kriteria.padEnd(38)} bobot=${k.bobot_kriteria}`);
  const subs = sortedSubs(subKriteriaList, k.id);
  for (const s of subs) {
    console.log(`    └ ${s.nama_sub_kriteria.padEnd(30)} bobot_sub=${s.bobot_sub_kriteria}  ket="${s.keterangan ?? "-"}"`);
  }
}

// ─── Data siswa ─────────────────────────────────────────────────────────────
console.log("\n[2] NILAI AKADEMIK SISWA");
for (const n of nilaiAkademik) {
  console.log(`  ${n.pelajaran.padEnd(45)} = ${n.nilai}`);
}
console.log("\n[3] TES MINAT:", tesMinatTypes.join(", "));

// ─── Matrix evaluasi ────────────────────────────────────────────────────────
console.log("\n[4] PILIHAN PROGRAM STUDI:", programIds.length, "prodi");
programList.forEach((ps) => console.log("  •", ps.nama_program_studi));

console.log("\n[5] MATRIX EVALUASI");

const matrixRows = [];

for (const ps of programList) {
  // Minat
  const riasecTypes = ps.riasec.flatMap((r) =>
    r.tipeRiasec.split(",").map((t) => t.trim().toUpperCase())
  );
  const matchCount = riasecTypes.filter((t) => tesMinatTypes.includes(t)).length;
  const minatSubs = minatK ? sortedSubs(subKriteriaList, minatK.id) : [];
  const minatIdx = matchCount >= 2 ? 0 : matchCount === 1 ? 1 : minatSubs.length - 1;
  const minatSub = minatSubs[Math.min(minatIdx, minatSubs.length - 1)];

  // Akademik
  const namaMapels = ps.mataPelajaranPendukung.map((m) => m.nama_mata_pelajaran);
  const matchedNilai = nilaiAkademik.filter((n) => namaMapels.includes(n.pelajaran));
  const avgScore = matchedNilai.length > 0
    ? Math.round(matchedNilai.reduce((s, n) => s + n.nilai, 0) / matchedNilai.length)
    : 0;
  const akademikSubs = akademikK ? sortedSubs(subKriteriaList, akademikK.id) : [];
  // proposal Tabel 3.5: 95-100→5, 90-94→4, 85-89→3, 80-84→2, 75-79→1
  const akIdx = avgScore >= 95 ? 0 : avgScore >= 90 ? 1 : avgScore >= 85 ? 2 : avgScore >= 80 ? 3 : akademikSubs.length - 1;
  const akademikSub = akademikSubs[Math.min(akIdx, akademikSubs.length - 1)];

  // Biaya
  const biaya = ps.biaya_kuliah;
  const biayaSubs = biayaK ? sortedSubs(subKriteriaList, biayaK.id) : [];
  const biayaIdx =
    biaya <= 10_137_000 ? 0 :
    biaya <= 15_788_000 ? 1 :
    biaya <= 19_804_000 ? 2 :
    biaya <= 22_273_000 ? 3 : biayaSubs.length - 1;
  const biayaSub = biayaSubs[Math.min(biayaIdx, biayaSubs.length - 1)];

  // Akreditasi
  const akreditasiSubs = akreditasiK ? sortedSubs(subKriteriaList, akreditasiK.id) : [];
  const grade = ps.akreditasi.trim().toUpperCase();
  const akrIdx = grade === "A" ? 0 : grade === "B" ? 1 : grade === "C" ? 2 : akreditasiSubs.length - 1;
  const akreditasiSub = akreditasiSubs[Math.min(akrIdx, akreditasiSubs.length - 1)];

  const row = {
    prodi: ps.nama_program_studi,
    prodiId: ps.id,
    minat: minatSub?.bobot_sub_kriteria ?? 0,
    akademik: akademikSub?.bobot_sub_kriteria ?? 0,
    biaya: biayaSub?.bobot_sub_kriteria ?? 0,
    akreditasi: akreditasiSub?.bobot_sub_kriteria ?? 0,
    minatLabel: `${minatSub?.nama_sub_kriteria ?? "-"} (match=${matchCount}, RIASEC prodi=${riasecTypes.join(",")})`,
    akademikLabel: `${akademikSub?.nama_sub_kriteria ?? "-"} (avg=${avgScore}, matched: ${matchedNilai.map((n) => `${n.pelajaran}=${n.nilai}`).join(" | ")})`,
    biayaLabel: `${biayaSub?.nama_sub_kriteria ?? "-"} (Rp ${biaya.toLocaleString("id-ID")})`,
    akreditasiLabel: `${akreditasiSub?.nama_sub_kriteria ?? "-"} (${ps.akreditasi})`,
  };
  matrixRows.push(row);

  console.log(`\n  ▶ ${ps.nama_program_studi}`);
  console.log(`    Minat      (${row.minat}): ${row.minatLabel}`);
  console.log(`    Akademik   (${row.akademik}): ${row.akademikLabel}`);
  console.log(`    Biaya      (${row.biaya}): ${row.biayaLabel}`);
  console.log(`    Akreditasi (${row.akreditasi}): ${row.akreditasiLabel}`);
}

// ─── Bobot ──────────────────────────────────────────────────────────────────
const wM  = minatK?.bobot_kriteria ?? 0;
const wA  = akademikK?.bobot_kriteria ?? 0;
const wB  = biayaK?.bobot_kriteria ?? 0;
const wAk = akreditasiK?.bobot_kriteria ?? 0;
const totalW = wM + wA + wB + wAk;
const nwM  = totalW > 0 ? wM  / totalW : 0.25;
const nwA  = totalW > 0 ? wA  / totalW : 0.25;
const nwB  = totalW > 0 ? wB  / totalW : 0.25;
const nwAk = totalW > 0 ? wAk / totalW : 0.25;

console.log("\n[6] BOBOT KRITERIA (raw → normalized)");
console.log(`  Minat       ${wM}  → ${fmt(nwM)}`);
console.log(`  Akademik    ${wA}  → ${fmt(nwA)}`);
console.log(`  Biaya       ${wB}  → ${fmt(nwB)}`);
console.log(`  Akreditasi  ${wAk}  → ${fmt(nwAk)}`);
console.log(`  Total       ${totalW}`);

// ─── Perbandingan dengan hasilPerhitungan yang tersimpan ────────────────────
console.log("\n[7] DATA YANG TERSIMPAN DI hasilPerhitungan (sub-kriteria score)");
for (const ps of programList) {
  const entries = hasilRaw.filter((h) => h.programStudiId === ps.id);
  console.log(`\n  ${ps.nama_program_studi}`);
  for (const e of entries) {
    console.log(`    ${e.kriteria.nama_kriteria.padEnd(35)} ${e.subKriteria.nama_sub_kriteria.padEnd(20)} nilai=${e.nilai}`);
  }
}

// ─── π(i,j) ─────────────────────────────────────────────────────────────────
const n = matrixRows.length;
console.log("\n[8] MATRIKS PREFERENSI π(i,j)");

const phiPlus  = new Array(n).fill(0);
const phiMinus = new Array(n).fill(0);

for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    if (i === j) continue;
    const a = matrixRows[i];
    const b = matrixRows[j];
    const pM  = a.minat     > b.minat     ? 1 : 0;
    const pA  = a.akademik  > b.akademik  ? 1 : 0;
    const pB  = a.biaya     > b.biaya     ? 1 : 0;
    const pAk = a.akreditasi > b.akreditasi ? 1 : 0;
    // rumus 2.7: π = (1/k) Σ H(d), k = jumlah kriteria (tanpa bobot)
    const K = 4;
    const pi  = (pM + pA + pB + pAk) / K;
    const label = `π(${a.prodi.substring(0,15).padEnd(15)}, ${b.prodi.substring(0,15).padEnd(15)})`;
    console.log(`  ${label} = (${pM} + ${pA} + ${pB} + ${pAk}) / ${K} = ${fmt(pi)}`);
    phiPlus[i]  += pi;
    phiMinus[j] += pi;
  }
}

// Normalize
for (let i = 0; i < n; i++) {
  phiPlus[i]  /= n - 1;
  phiMinus[i] /= n - 1;
}

// ─── Hasil akhir ─────────────────────────────────────────────────────────────
console.log("\n[9] RANKING AKHIR — φ⁺=leaving, φ⁻=entering, φ=net flow");
console.log(line());

const ranking = matrixRows
  .map((r, i) => ({
    prodi: r.prodi,
    phiPlus:  phiPlus[i],
    phiMinus: phiMinus[i],
    netFlow:  phiPlus[i] - phiMinus[i],
  }))
  .sort((a, b) => b.netFlow - a.netFlow);

let rank = 1;
for (const r of ranking) {
  console.log(`  #${rank++}  ${r.prodi.padEnd(35)}  φ⁺=${fmt(r.phiPlus)}  φ⁻=${fmt(r.phiMinus)}  φ=${fmt(r.netFlow)}`);
}
console.log(line());

// ─── Bandingkan dengan proposal ──────────────────────────────────────────────
console.log("\nCatatan: Bandingkan ranking di atas dengan halaman 47-56 proposal.");
console.log("Kalau beda, kemungkinan perbedaan di:");
console.log("  1. Threshold biaya kuliah (lihat [5] kolom biaya tiap prodi)");
console.log("  2. Range nilai akademik (sekarang: ≥90→5, ≥80→4, ≥70→3, ≥60→2, <60→1)");
console.log("  3. Bobot kriteria di DB (lihat [6])");

await prisma.$disconnect();
