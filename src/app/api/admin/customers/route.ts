import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  const customers = await db.user.findMany({
    where: {
      role: 'CUSTOMER',
      ...(q
        ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] }
        : {}),
    },
    include: {
      orders: { select: { id: true, total: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    totalOrders: c.orders.length,
    totalSpent: c.orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0),
  }));

  return NextResponse.json(result);
}