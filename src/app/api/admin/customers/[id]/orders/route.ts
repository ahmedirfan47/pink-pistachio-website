import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: params.id },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}