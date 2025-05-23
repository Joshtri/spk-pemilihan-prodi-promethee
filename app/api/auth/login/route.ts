import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie"; // npm install cookie

interface LoginRequestBody {
  email: string;
  password: string;
}

interface JwtUserPayload {
  id: string;
  nama: string;
  email: string;
  role: "ADMIN" | "SISWA";
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ message: "Missing email or password" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { password: _, ...userData } = user;

    const token = jwt.sign(userData, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });

    // Update login time & log activity
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.log.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        metadata: {
          email: user.email,
          userAgent: request.headers.get("user-agent") || "unknown",
          ip: request.headers.get("x-forwarded-for") || "unknown",
        },
      },
    });

    // Serialize cookie
    const serialized = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Return JSON + Set-Cookie header manually
    return new NextResponse(
      JSON.stringify({ user: userData }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": serialized,
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Login failed. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
