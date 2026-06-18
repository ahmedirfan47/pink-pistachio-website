import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { couponSchema } from '@/lib/validations';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = couponSchema.parse(body);

    const existing = await db.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 409 });

    const coupon = await db.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues[0]?.message || 'Invalid data' }, { status: 400 });
    console.error('[admin/coupons POST] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}