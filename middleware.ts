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
  // Public path hanya untuk halaman login, register, dan unauthorized
  const publicPaths = ["/", "/login", "/register", "/unauthorized"];
  const isPublicPath = publicPaths.some((p) => path === p || path.startsWith(p));

  if (isPublicPath) {
    // Jika user sudah login, redirect ke dashboard sesuai role
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        const role = payload.role;

        if (path === "/" || path === "/login") {
          const redirectTo =
            role === "ADMIN" ? "/admin/dashboard" : "/siswa/dashboard";
          return NextResponse.redirect(new URL(redirectTo, req.url));
        }
      } catch (err) {
        // Token invalid → lanjut saja ke public route
        console.warn("Token invalid di public path, lanjut ke halaman:", path);
      }
    }

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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
