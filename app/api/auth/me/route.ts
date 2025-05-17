import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

interface AuthUser {
  id: string;
  nama: string;
  role: "admin" | "SISWA";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
    return NextResponse.json({ user });
  } catch (error) {
    console.error("JWT verify error:", error);
    return NextResponse.json({ user: null });
  }
}
