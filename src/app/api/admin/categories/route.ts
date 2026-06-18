import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const categories = await db.category.findMany({
    orderBy: { position: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = categorySchema.parse(body);

    const existing = await db.category.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 409 });

    const category = await db.category.create({ data: { ...data, description: data.description || null, image: data.image || null } });
    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || 'Invalid data' }, { status: 400 });
    console.error('[admin/categories POST] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}