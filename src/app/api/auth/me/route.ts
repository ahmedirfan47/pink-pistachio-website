import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  return NextResponse.json(
    { id: session.id, name: session.name, email: session.email, role: session.role },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}