// app/api/dashboard/recent-students/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const recentStudents = await prisma.user.findMany({
            where: { role: 'SISWA' },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                nilaiAkademik: { take: 1 },
                tesMinat: { take: 1 }
            }
        })

        const formattedStudents = recentStudents.map(student => ({
            id: student.id,
            name: student.name || 'N/A',
            email: student.email,
            registrationDate: student.createdAt,
            status: student.nilaiAkademik.length > 0 && student.tesMinat.length > 0
                ? 'Aktif'
                : 'Pending'
        }))

        return NextResponse.json(formattedStudents)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch recent students" },
            { status: 500 }
        )
    }
}