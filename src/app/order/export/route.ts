import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const orders = await db.order.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + 'T23:59:59') } : {}),
            },
          }
        : {}),
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  const headers = [
    'Order Number', 'Date', 'Customer Name', 'Email', 'Phone',
    'Delivery Type', 'Branch/Address', 'Area', 'City',
    'Items', 'Subtotal (Rs)', 'Discount (Rs)', 'Delivery Fee (Rs)', 'Total (Rs)',
    'Coupon Code', 'Payment Method', 'Status', 'Notes',
  ];

  const rows = orders.map((o) => [
    escapeCsv(o.orderNumber),
    escapeCsv(new Date(o.createdAt).toLocaleDateString('en-PK')),
    escapeCsv(o.customerName),
    escapeCsv(o.customerEmail),
    escapeCsv(o.customerPhone),
    escapeCsv(o.deliveryType),
    escapeCsv(o.deliveryType === 'pickup' ? o.branch : o.address),
    escapeCsv(o.area),
    escapeCsv(o.city),
    escapeCsv(o.items.map((i) => i.name + ' x' + i.quantity).join(' | ')),
    escapeCsv(o.subtotal),
    escapeCsv(o.discount),
    escapeCsv(o.deliveryFee),
    escapeCsv(o.total),
    escapeCsv(o.couponCode),
    escapeCsv(o.paymentMethod),
    escapeCsv(o.status),
    escapeCsv(o.notes),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const filename = 'pink-pistachio-orders-' + new Date().toISOString().slice(0, 10) + '.csv';

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  });
}