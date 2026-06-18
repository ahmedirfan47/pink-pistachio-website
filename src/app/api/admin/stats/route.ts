import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(now);
  last7Days.setDate(now.getDate() - 6);
  last7Days.setHours(0, 0, 0, 0);
  const last30Days = new Date(now);
  last30Days.setDate(now.getDate() - 29);
  last30Days.setHours(0, 0, 0, 0);

  const [
    totalRevenueAgg,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    todayOrdersAgg,
    last30Orders,
    recentOrders,
    topProducts,
    lowStock,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    db.order.count(),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.product.count(),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfToday }, status: { not: 'CANCELLED' } },
    }),
    db.order.findMany({
      where: { createdAt: { gte: last30Days }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, total: true },
    }),
    db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    db.orderItem.groupBy({
      by: ['name'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    db.product.findMany({ where: { stock: { lte: 5 }, isAvailable: true }, take: 5, orderBy: { stock: 'asc' } }),
  ]);

  // Build last 7 days revenue chart data
  const chartData: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(last7Days);
    day.setDate(last7Days.getDate() + i);
    const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOrders = last30Orders.filter((o) => {
      const od = new Date(o.createdAt);
      return od.toDateString() === day.toDateString();
    });
    chartData.push({
      date: dayLabel,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    });
  }

  return NextResponse.json({
    totalRevenue: totalRevenueAgg._sum.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    todayRevenue: todayOrdersAgg._sum.total || 0,
    todayOrders: todayOrdersAgg._count || 0,
    chartData,
    recentOrders,
    topProducts: topProducts.map((p) => ({ name: p.name, quantity: p._sum.quantity || 0 })),
    lowStock,
  });
}