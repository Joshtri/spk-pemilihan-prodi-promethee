import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return payload as { id: string; role: string };
  } catch (e) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get('token')?.value || '';

  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path === '/'
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const role = user.role;

  if (role === 'SISWA' && !path.startsWith('/siswa')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (role === 'ADMIN' && !path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/siswa/:path*', '/admin/:path*', '/dashboard', '/profile'],
};
