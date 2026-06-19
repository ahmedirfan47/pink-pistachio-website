import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { productSchema } from '@/lib/validations';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const slugConflict = await db.product.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (slugConflict) {
      return NextResponse.json(
        { error: 'A product with this slug already exists.' },
        { status: 409 }
      );
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        images: data.images,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isAvailable: data.isAvailable,
        stock: data.stock,
        sku: data.sku ?? null,
        tags: data.tags,
      },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? 'Invalid data' },
        { status: 400 }
      );
    }
    console.error('[admin/products PUT] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/products DELETE] error:', err);
    return NextResponse.json(
      { error: 'Could not delete product. It may be referenced by existing orders.' },
      { status: 400 }
    );
  }
}