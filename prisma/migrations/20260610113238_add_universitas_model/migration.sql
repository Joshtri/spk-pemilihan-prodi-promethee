-- AlterTable
ALTER TABLE "ProgramStudi" ADD COLUMN     "universitasId" VARCHAR(80);

-- CreateTable
CREATE TABLE "Universitas" (
    "id" VARCHAR(80) NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Universitas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramStudi" ADD CONSTRAINT "ProgramStudi_universitasId_fkey" FOREIGN KEY ("universitasId") REFERENCES "Universitas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
