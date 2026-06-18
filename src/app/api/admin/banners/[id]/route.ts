import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { bannerSchema } from '@/lib/validations';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = bannerSchema.parse(body);

    const banner = await db.banner.update({
      where: { id: params.id },
      data: { ...data, title: data.title || null, subtitle: data.subtitle || null, link: data.link || null },
    });

    return NextResponse.json(banner);
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || 'Invalid data' }, { status: 400 });
    console.error('[admin/banners PUT] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.banner.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/banners DELETE] error:', err);
    return NextResponse.json({ error: 'Could not delete banner' }, { status: 400 });
  }
}