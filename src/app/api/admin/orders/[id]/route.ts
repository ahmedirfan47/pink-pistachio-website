import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { sendOrderStatusEmail } from '@/lib/email';
import { ORDER_STATUSES, STATUS_LABELS } from '@/lib/utils';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = updateSchema.parse(body);

    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    sendOrderStatusEmail(
      order.customerEmail,
      order.orderNumber,
      STATUS_LABELS[status],
      order.customerName
    ).catch(() => {});

    return NextResponse.json(order);
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    console.error('[admin/orders PUT] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}