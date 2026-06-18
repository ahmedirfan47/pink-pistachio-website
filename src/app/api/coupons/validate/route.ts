import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ error: 'Enter a coupon code' }, { status: 400 });

    const coupon = await db.coupon.findUnique({ where: { code: String(code).toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }
    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()} required` }, { status: 400 });
    }

    const discount = coupon.type === 'PERCENTAGE' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;

    return NextResponse.json({
      valid: true,
      discount: Math.min(discount, subtotal),
      message: coupon.type === 'PERCENTAGE' ? `${coupon.value}% discount applied!` : `Rs. ${coupon.value} off applied!`,
    });
  } catch (err) {
    console.error('[coupons/validate] error:', err);
    return NextResponse.json({ error: 'Could not validate coupon' }, { status: 500 });
  }
}