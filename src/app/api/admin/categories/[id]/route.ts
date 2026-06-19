import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { categorySchema } from '@/lib/validations';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = categorySchema.parse(body);

    const slugConflict = await db.category.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (slugConflict) {
      return NextResponse.json(
        { error: 'A category with this slug already exists.' },
        { status: 409 }
      );
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image ?? null,
        position: data.position,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(category);
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? 'Invalid data' },
        { status: 400 }
      );
    }
    console.error('[admin/categories PUT] error:', err);
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
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${productCount} product(s) use this category. Move or delete them first.` },
        { status: 400 }
      );
    }
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/categories DELETE] error:', err);
    return NextResponse.json({ error: 'Could not delete category' }, { status: 400 });
  }
}