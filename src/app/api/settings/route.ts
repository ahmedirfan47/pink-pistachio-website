import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const settings = await db.siteSettings.findUnique({ where: { id: 'settings' } });
  return NextResponse.json(
    settings || { deliveryFee: 150, freeDeliveryMin: 3000 },
    { headers: { 'Cache-Control': 'public, max-age=60' } }
  );
}