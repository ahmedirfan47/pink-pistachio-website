import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { bannerSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || '';

  const banners = await db.banner.findMany({
    where: type ? { type: type as any } : {},
    orderBy: [{ type: 'asc' }, { position: 'asc' }],
  });

  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = bannerSchema.parse(body);

    const banner = await db.banner.create({
      data: { ...data, title: data.title || null, subtitle: data.subtitle || null, link: data.link || null },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || 'Invalid data' }, { status: 400 });
    console.error('[admin/banners POST] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}