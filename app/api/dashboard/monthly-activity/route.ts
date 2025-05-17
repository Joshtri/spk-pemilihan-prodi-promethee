// app/api/dashboard/monthly-activity/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        const currentYear = new Date().getFullYear()

        const monthlyData = await Promise.all(months.map(async (month, index) => {
            const monthNumber = index + 1
            const startDate = new Date(currentYear, monthNumber - 1, 1)
            const endDate = new Date(currentYear, monthNumber, 0)

            const [siswaCount, evaluasiCount] = await Promise.all([
                prisma.user.count({
                    where: {
                        role: 'SISWA',
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }),
                prisma.evaluasiKriteria.count({
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                })
            ])

            return {
                name: month,
                siswa: siswaCount,
                evaluasi: evaluasiCount
            }
        }))

        return NextResponse.json(monthlyData)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch monthly activity" },
            { status: 500 }
        )
    }
}