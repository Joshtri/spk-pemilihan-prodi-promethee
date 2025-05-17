/*
  Warnings:

  - You are about to drop the column `programStudiId` on the `EvaluasiKriteria` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EvaluasiKriteria" DROP CONSTRAINT "EvaluasiKriteria_programStudiId_fkey";

-- AlterTable
ALTER TABLE "EvaluasiKriteria" DROP COLUMN "programStudiId";
