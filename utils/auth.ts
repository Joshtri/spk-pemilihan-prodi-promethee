import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

// Definisikan tipe payload user dari JWT
export interface AuthUser extends JwtPayload {
  id: string;
  name: string;
  role: "ADMIN" | "SISWA";
}

/**
 * Mengambil data user dari cookie `auth_token` (JWT)
 * @returns {AuthUser | null} user payload dari token atau null jika tidak valid
 */

export async function getUserFromCookie(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}
