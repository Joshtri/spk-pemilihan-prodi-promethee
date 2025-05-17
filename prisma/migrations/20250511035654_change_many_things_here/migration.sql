/*
  Warnings:

  - You are about to drop the `Penilaian` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Penilaian" DROP CONSTRAINT "Penilaian_kriteriaId_fkey";

-- DropForeignKey
ALTER TABLE "Penilaian" DROP CONSTRAINT "Penilaian_programStudiId_fkey";

-- DropForeignKey
ALTER TABLE "Penilaian" DROP CONSTRAINT "Penilaian_subKriteriaId_fkey";

-- DropForeignKey
ALTER TABLE "Penilaian" DROP CONSTRAINT "Penilaian_userId_fkey";

-- AlterTable
ALTER TABLE "HasilPerhitungan" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Kriteria" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MataPelajaranPendukung" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "NilaiAkademikSiswa" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProgramStudi" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProgramStudiRiasec" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RumpunIlmu" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SubKriteria" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TesMinatSiswa" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;

-- DropTable
DROP TABLE "Penilaian";

-- CreateTable
CREATE TABLE "EvaluasiKriteria" (
    "id" VARCHAR(80) NOT NULL,
    "userId" VARCHAR(80) NOT NULL,
    "kriteriaId" VARCHAR(80) NOT NULL,
    "subKriteriaId" VARCHAR(80) NOT NULL,
    "programStudiId" VARCHAR(80) NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluasiKriteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EvaluasiKriteria" ADD CONSTRAINT "EvaluasiKriteria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluasiKriteria" ADD CONSTRAINT "EvaluasiKriteria_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluasiKriteria" ADD CONSTRAINT "EvaluasiKriteria_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "SubKriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluasiKriteria" ADD CONSTRAINT "EvaluasiKriteria_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
