import { NextResponse } from "next/server";
import { runPrometheePreview } from "@/lib/promethee/promethee-preview-engine";
import { getUserFromCookie } from "@/utils/auth";

export async function POST(req: Request) {
    const user = await getUserFromCookie();

    if (!user || user.role !== "SISWA") {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const programStudiIds: string[] = body.programStudiIds || [];
    const includeDetails: boolean = body.includeDetails || false;

    if (programStudiIds.length === 0) {
        return NextResponse.json(
            { success: false, message: "Tidak ada program studi yang dipilih" },
            { status: 400 }
        );
    }

    try {
        const results = await runPrometheePreview(user.id, programStudiIds, includeDetails);
        return NextResponse.json({ success: true, ...results });
    } catch (error) {
        console.error("PROMETHEE error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghitung PROMETHEE" },
            { status: 500 }
        );
    }
}
