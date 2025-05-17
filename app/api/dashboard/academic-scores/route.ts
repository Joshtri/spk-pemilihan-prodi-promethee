// app/api/dashboard/academic-scores/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const averageScores = await prisma.nilaiAkademikSiswa.groupBy({
      by: ['pelajaran'],
      _avg: {
        nilai: true
      }
    })

    const formattedScores = averageScores.map(score => ({
      name: score.pelajaran,
      nilai: Math.round(score._avg.nilai || 0)
    }))

    return NextResponse.json(formattedScores)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch academic scores" },
      { status: 500 }
    )
  }
}