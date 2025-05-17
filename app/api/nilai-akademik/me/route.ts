import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/utils/auth";

export async function GET() {
    const user = await getUserFromCookie();
    if (!user || user.role !== "SISWA") {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // const user = {
    //     id: "b24db3c5-0dbc-4deb-9881-db4801245632", // Replace with actual user ID
    //     role: "SISWA", // Replace with actual user role
    // };

    
    // Fetch the academic scores for the logged-in student
    const data = await prisma.nilaiAkademikSiswa.findMany({
        where: { userId: user.id },
        orderBy: { pelajaran: "asc" },
    });

    return NextResponse.json({ success: true, data });
}
