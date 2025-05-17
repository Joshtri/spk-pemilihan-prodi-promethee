import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/utils/auth";

export async function GET() {
    try {
        const user = await getUserFromCookie();

        if (!user || user.role !== "SISWA") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const hasil = await prisma.hasilPerhitungan.findMany({
            where: { userId: user.id },
            include: {
                programStudi: {
                    include: {
                        RumpunIlmu: true,
                    },
                },
            },
        });

        const countMap: Record<string, number> = {};

        for (const h of hasil) {
            const rumpun = h.programStudi.RumpunIlmu?.nama || "Lainnya";
            countMap[rumpun] = (countMap[rumpun] || 0) + 1;
        }

        const total = Object.values(countMap).reduce((a, b) => a + b, 0);

        const distribution = Object.entries(countMap).map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? (value / total) * 100 : 0,
        }));

        return NextResponse.json(distribution);
    } catch (error) {
        console.error("Error in rumpun-ilmu-distribution API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
