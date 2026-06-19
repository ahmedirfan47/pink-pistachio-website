import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Try to fetch notifications — if table doesn't exist yet, return empty
    const [dbNotifications, pendingOrders, lowStockProducts, newMessages] =
      await Promise.all([
        db.notification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 30,
        }).catch(() => []),
        db.order.count({ where: { status: 'PENDING' } }).catch(() => 0),
        db.product.findMany({
          where: { stock: { lte: 5 }, isAvailable: true },
          select: { id: true, name: true, stock: true },
          orderBy: { stock: 'asc' },
        }).catch(() => []),
        db.contactMessage.count({ where: { status: 'new' } }).catch(() => 0),
      ]);

    const unreadCount = (dbNotifications as any[]).filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: (dbNotifications as any[]).map((n) => ({
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
        lowStockCount: (lowStockProducts as any[]).length,
        lowStockItems: lowStockProducts,
        newMessages,
      },
    });
  } catch (err) {
    console.error('[notifications GET] error:', err);
    // Return empty state — never crash the admin shell
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      summary: { pendingOrders: 0, lowStockCount: 0, lowStockItems: [], newMessages: 0 },
    });
  }
}