import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { type Prisma } from '@prisma/client';

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q      = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status: status as Prisma.EnumOrderStatusFilter['equals'] } : {}),
    ...(q ? {
      OR: [
        { orderNumber:   { contains: q, mode: 'insensitive' } },
        { customerName:  { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ],
    } : {}),
  };

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user:  { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(orders);
}