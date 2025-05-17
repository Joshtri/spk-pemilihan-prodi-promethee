// app/api/dashboard/program-studi-stats/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const stats = await prisma.programStudi.findMany({
            include: {
                _count: {
                    select: { PilihanProgramStudi: true }
                }
            },
            orderBy: {
                PilihanProgramStudi: {
                    _count: 'desc'
                }
            },
            take: 5
        })

        const formattedStats = stats.map(program => ({
            name: program.nama_program_studi,
            count: program._count.PilihanProgramStudi
        }))

        return NextResponse.json(formattedStats)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch program studi statistics" },
            { status: 500 }
        )
    }
}