import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders, totalCustomers, totalProducts, pendingOrders,
      revenueAgg, todayOrders, todayRevenueAgg, recentOrders, lowStock,
    ] = await Promise.all([
      db.order.count({ where: { status: { not: 'CANCELLED' } } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.product.count(),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      db.order.count({ where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } } }),
      db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, orderNumber: true, customerName: true, total: true, status: true },
      }),
      db.product.findMany({
        where: { stock: { lte: 5 }, isAvailable: true },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
    ]);

    // Chart: last 7 days
    const chartData = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d    = new Date(now.getTime() - (6 - i) * 86_400_000);
        const from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const to   = new Date(from.getTime() + 86_400_000);
        return db.order
          .aggregate({
            _sum: { total: true }, _count: true,
            where: { createdAt: { gte: from, lt: to }, status: { not: 'CANCELLED' } },
          })
          .then((r) => ({
            date:    from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            revenue: r._sum.total ?? 0,
            orders:  r._count,
          }));
      })
    );

    // Top products by quantity sold
    const grouped = await db.orderItem.groupBy({
      by: ['name'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return NextResponse.json({
      totalRevenue:   revenueAgg._sum.total      ?? 0,
      todayRevenue:   todayRevenueAgg._sum.total ?? 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      todayOrders,
      chartData,
      recentOrders,
      topProducts: grouped.map((g) => ({ name: g.name, quantity: g._sum.quantity ?? 0 })),
      lowStock,
    });
  } catch (err) {
    console.error('[admin/stats] error:', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}