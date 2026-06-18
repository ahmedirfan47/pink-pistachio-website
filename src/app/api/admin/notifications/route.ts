import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [dbNotifications, pendingOrders, lowStockProducts, newMessages] = await Promise.all([
      db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      db.order.count({ where: { status: 'PENDING' } }),
      db.product.findMany({
        where: { stock: { lte: 5 }, isAvailable: true },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' },
      }),
      db.contactMessage.count({ where: { status: 'new' } }),
    ]);

    const unreadCount = dbNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: dbNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link ?? '/admin/dashboard',
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
      summary: {
        pendingOrders,
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts,
        newMessages,
      },
    });
  } catch (err) {
    console.error('[notifications GET] error:', err);
    return NextResponse.json({ notifications: [], unreadCount: 0, summary: {} }, { status: 200 });
  }
}