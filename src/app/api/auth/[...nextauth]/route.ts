import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Next.js 16: params is now a Promise — must be awaited before passing to NextAuth
// Without this, NextAuth receives Promise<{nextauth:string[]}> instead of string[]
// causing every auth route (signin, callback, error) to crash with 500

const nextAuthHandler = NextAuth(authOptions);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await params;
  return (nextAuthHandler as Function)(req, { params: resolvedParams });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await params;
  return (nextAuthHandler as Function)(req, { params: resolvedParams });
}