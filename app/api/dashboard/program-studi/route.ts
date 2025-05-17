// app/api/dashboard/program-studi/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const programStudi = await prisma.programStudi.findMany({
      include: {
        RumpunIlmu: true
      },
      orderBy: {
        nama_program_studi: 'asc'
      }
    })

    const formattedPrograms = programStudi.map(program => ({
      id: program.id,
      name: program.nama_program_studi,
      akreditasi: program.akreditasi,
      biayaKuliah: program.biaya_kuliah,
      rumpunIlmu: program.RumpunIlmu?.nama || 'Lainnya'
    }))

    return NextResponse.json(formattedPrograms)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch program studi list" },
      { status: 500 }
    )
  }
}