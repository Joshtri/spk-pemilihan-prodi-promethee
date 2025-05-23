-- DropForeignKey
ALTER TABLE "ProgramStudiRiasec" DROP CONSTRAINT "ProgramStudiRiasec_programStudiId_fkey";

-- AlterTable
ALTER TABLE "ProgramStudiRiasec" ALTER COLUMN "programStudiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramStudiRiasec" ADD CONSTRAINT "ProgramStudiRiasec_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
