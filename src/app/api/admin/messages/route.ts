import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(messages);
}