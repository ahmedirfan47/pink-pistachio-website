import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth-token';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass all auth API routes through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value ?? null;
  const session = token ? verifyToken(token) : null;
  const role = session?.role;

  if (pathname.startsWith('/admin')) {
    if (!session || role !== 'ADMIN') {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/account')) {
    if (!session) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};