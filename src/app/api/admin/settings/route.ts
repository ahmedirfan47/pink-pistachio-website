import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { settingsSchema } from '@/lib/validations';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await db.siteSettings.findUnique({ where: { id: 'settings' } });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);

    const settings = await db.siteSettings.upsert({
      where: { id: 'settings' },
      update: data,
      create: { id: 'settings', ...data },
    });

    return NextResponse.json(settings);
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || 'Invalid data' }, { status: 400 });
    console.error('[admin/settings PUT] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}