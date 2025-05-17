/*
  Warnings:

  - Added the required column `programStudiId` to the `EvaluasiKriteria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EvaluasiKriteria" ADD COLUMN     "programStudiId" VARCHAR(80) NOT NULL;

-- CreateTable
CREATE TABLE "PilihanProgramStudi" (
    "id" VARCHAR(80) NOT NULL,
    "userId" VARCHAR(80) NOT NULL,
    "programStudiId" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilihanProgramStudi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EvaluasiKriteria" ADD CONSTRAINT "EvaluasiKriteria_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilihanProgramStudi" ADD CONSTRAINT "PilihanProgramStudi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilihanProgramStudi" ADD CONSTRAINT "PilihanProgramStudi_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
