import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

// Fungsi untuk mendapatkan secret key dalam bentuk Uint8Array
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET tidak tersedia di environment");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value || "";

  console.log("➡️ MIDDLEWARE | path:", path);
  console.log("➡️ MIDDLEWARE | token:", token.substring(0, 20) + "...");

  // Public route → tidak perlu cek token
  const publicPaths = ["/", "/login", "/register", "/unauthorized"];
  if (publicPaths.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next();
  }

  // Token tidak ada
  if (!token) {
    console.warn("❌ Token tidak ditemukan. Redirect ke /");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Verifikasi token dengan jose (Edge-compatible)
  let payload: JWTPayload;
  try {
    const { payload: verifiedPayload } = await jwtVerify(token, getJwtSecret());
    payload = verifiedPayload;
    console.log("✅ Token valid:", payload);
  } catch (err) {
    console.error("❌ Token tidak valid:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Role-based route protection
  const userRole = payload.role;
  if (userRole === "SISWA" && !path.startsWith("/siswa")) {
    console.warn("🚫 SISWA mengakses non-/siswa route");
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (userRole === "ADMIN" && !path.startsWith("/admin")) {
    console.warn("🚫 ADMIN mengakses non-/admin route");
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/siswa/:path*', '/admin/:path*', '/dashboard', '/profile'],
};
