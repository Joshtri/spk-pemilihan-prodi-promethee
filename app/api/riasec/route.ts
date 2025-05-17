import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.programStudiRiasec.findMany({
            include: {
                programStudi: {
                    select: {
                        id: true,
                        nama_program_studi: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET RIASEC error:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}

// POST - Create new mapping
export async function POST(req: Request) {
    try {
      const body = await req.json();
      
      // Validation
      if (!body.programStudiId || !body.tipeRiasec) {
        return NextResponse.json(
          { error: "Program studi dan tipe RIASEC harus diisi" },
          { status: 400 }
        );
      }
  
      // Check if mapping already exists
      const existingMapping = await prisma.programStudiRiasec.findFirst({
        where: {
          programStudiId: body.programStudiId,
          tipeRiasec: body.tipeRiasec,
        },
      });
  
      if (existingMapping) {
        return NextResponse.json(
          { error: "Mapping ini sudah ada" },
          { status: 409 }
        );
      }
  
      // Create new mapping
      const result = await prisma.programStudiRiasec.create({
        data: {
          programStudiId: body.programStudiId,
          tipeRiasec: body.tipeRiasec,
        },
        include: {
          programStudi: true,
        },
      });
  
      return NextResponse.json({ 
        success: true, 
        data: {
          id: result.id,
          programStudiId: result.programStudiId,
          programStudi: result.programStudi.nama_program_studi,
          tipeRiasec: result.tipeRiasec,
        }
      });
  
    } catch (error) {
      console.error("POST RIASEC error:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan data mapping RIASEC" },
        { status: 500 }
      );
    }
  }