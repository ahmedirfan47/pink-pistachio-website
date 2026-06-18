import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { productSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const products = await db.product.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 });

    const product = await db.product.create({
      data: {
        ...data,
        compareAtPrice: data.compareAtPrice || null,
        sku: data.sku || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || 'Invalid data' }, { status: 400 });
    console.error('[admin/products POST] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}