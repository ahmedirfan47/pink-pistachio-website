import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function POST() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}