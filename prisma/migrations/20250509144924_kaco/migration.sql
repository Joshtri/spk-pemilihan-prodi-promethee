-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SISWA');

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('usr_', gen_random_uuid()),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramStudi" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('prodi_', gen_random_uuid()),
    "nama_program_studi" TEXT NOT NULL,
    "biaya_kuliah" INTEGER NOT NULL,
    "akreditasi" VARCHAR(20) NOT NULL,
    "keterangan" TEXT,
    "rumpunIlmuId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramStudi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataPelajaranPendukung" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('mp_', gen_random_uuid()),
    "programStudiId" VARCHAR(80) NOT NULL,
    "nama_mata_pelajaran" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MataPelajaranPendukung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramStudiRiasec" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('riasec_', gen_random_uuid()),
    "programStudiId" VARCHAR(80) NOT NULL,
    "tipeRiasec" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramStudiRiasec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('krt_', gen_random_uuid()),
    "nama_kriteria" TEXT NOT NULL,
    "keterangan" TEXT,
    "bobot_kriteria" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubKriteria" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('skr_', gen_random_uuid()),
    "kriteriaId" VARCHAR(80) NOT NULL,
    "nama_sub_kriteria" TEXT NOT NULL,
    "bobot_sub_kriteria" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubKriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilaiAkademikSiswa" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('na_', gen_random_uuid()),
    "userId" VARCHAR(80) NOT NULL,
    "pelajaran" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NilaiAkademikSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesMinatSiswa" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('minat_', gen_random_uuid()),
    "userId" VARCHAR(80) NOT NULL,
    "tipe" TEXT NOT NULL,
    "skor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TesMinatSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penilaian" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('pnl_', gen_random_uuid()),
    "userId" VARCHAR(80) NOT NULL,
    "programStudiId" VARCHAR(80) NOT NULL,
    "kriteriaId" VARCHAR(80) NOT NULL,
    "subKriteriaId" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RumpunIlmu" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('rumpun_', gen_random_uuid()),
    "nama" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RumpunIlmu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasilPerhitungan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('hsl_', gen_random_uuid()),
    "userId" VARCHAR(80) NOT NULL,
    "programStudiId" VARCHAR(80) NOT NULL,
    "kriteriaId" VARCHAR(80) NOT NULL,
    "subKriteriaId" VARCHAR(80) NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HasilPerhitungan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ProgramStudi" ADD CONSTRAINT "ProgramStudi_rumpunIlmuId_fkey" FOREIGN KEY ("rumpunIlmuId") REFERENCES "RumpunIlmu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MataPelajaranPendukung" ADD CONSTRAINT "MataPelajaranPendukung_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramStudiRiasec" ADD CONSTRAINT "ProgramStudiRiasec_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubKriteria" ADD CONSTRAINT "SubKriteria_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAkademikSiswa" ADD CONSTRAINT "NilaiAkademikSiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesMinatSiswa" ADD CONSTRAINT "TesMinatSiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "SubKriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilPerhitungan" ADD CONSTRAINT "HasilPerhitungan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilPerhitungan" ADD CONSTRAINT "HasilPerhitungan_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilPerhitungan" ADD CONSTRAINT "HasilPerhitungan_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilPerhitungan" ADD CONSTRAINT "HasilPerhitungan_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "SubKriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
