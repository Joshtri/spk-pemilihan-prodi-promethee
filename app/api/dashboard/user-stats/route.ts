// app/api/dashboard/user-stats/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const totalSiswa = await prisma.user.count({
            where: { role: 'SISWA' }
        })

        const activeThisMonth = await prisma.user.count({
            where: {
                role: 'SISWA',
                lastLoginAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        })

        const incompleteProfiles = await prisma.user.count({
            where: {
                role: 'SISWA',
                OR: [
                    { name: { equals: '' } },
                    { email: { equals: '' } },
                    { nilaiAkademik: { none: {} } },
                    { tesMinat: { none: {} } }
                ]
            }
        })

        return NextResponse.json([
            { name: "Total Siswa", value: totalSiswa },
            { name: "Aktif Bulan Ini", value: activeThisMonth },
            { name: "Belum Lengkap Profil", value: incompleteProfiles }
        ])
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch user statistics" },
            { status: 500 }
        )
    }
}