import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

const getIdFromRequest = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

export async function GET(req: NextRequest): Promise<NextResponse<UserResponse>> {
  const id = getIdFromRequest(req);
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      // Remove the include if there's no relation, or use the correct relation name
      // For example, if it's a "role" singular field instead of "roles":
      // include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /users/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const id = getIdFromRequest(req);
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!email || !role) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const dataToUpdate: any = { name, email, role };
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /users/[id] error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<UserResponse>> {
  const id = getIdFromRequest(req);
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
  }

  try {
    // Delete all related records first to avoid foreign key constraint errors
    await prisma.$transaction([
      // Delete Log records
      prisma.log.deleteMany({ where: { userId: id } }),
      // Delete NilaiAkademik records
      prisma.nilaiAkademikSiswa.deleteMany({ where: { userId: id } }),
      // Delete TesMinat records
      prisma.tesMinatSiswa.deleteMany({ where: { userId: id } }),
      // Delete HasilPerhitungan records
      prisma.hasilPerhitungan.deleteMany({ where: { userId: id } }),
      // Delete EvaluasiKriteria records
      prisma.evaluasiKriteria.deleteMany({ where: { userId: id } }),
      // Delete PilihanProgramStudi records
      prisma.pilihanProgramStudi.deleteMany({ where: { userId: id } }),
      // Finally delete the user
      prisma.user.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: unknown) {
    console.error("DELETE /users/[id] error:", error);

    const errorMessage = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
