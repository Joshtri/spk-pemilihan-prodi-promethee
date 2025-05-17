import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // ⬅️ import bcrypt

export async function GET() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
}


export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { name, email, password, role } = body;
  
      if (!email || !password || !role) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role, // ✅ langsung simpan enum, bukan array
        },
      });
  
      return NextResponse.json({ success: true, data: user });
    } catch (error: unknown) {
      console.error("POST /users error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 500 }
      );
    }
  }