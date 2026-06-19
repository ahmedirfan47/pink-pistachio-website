import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth API routes — NextAuth handles these itself
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const useSecureCookies = req.url.startsWith('https://');
  const cookieName = useSecureCookies
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  let token = null;

  try {
    // Try with the environment-appropriate cookie name
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });

    // Fallback: try the other cookie name in case of mismatch
    if (!token) {
      const fallbackName = useSecureCookies
        ? 'next-auth.session-token'
        : '__Secure-next-auth.session-token';
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: fallbackName,
      });
    }
  } catch (err) {
    console.error('[proxy] getToken error:', err);
    token = null;
  }

  const role = (token as any)?.role;

  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'ADMIN') {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/account')) {
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ],
};