'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Users, Package, Clock, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '@/components/admin/StatCard';
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  todayRevenue: number;
  todayOrders: number;
  chartData: { date: string; revenue: number; orders: number }[];
  recentOrders: any[];
  topProducts: { name: string; quantity: number }[];
  lowStock: any[];
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="flex h-64 items-center justify-center text-charcoal-600">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(stats.totalRevenue)} icon={DollarSign} color="pink" />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} icon={ShoppingCart} color="pistachio" />
        <StatCard label="Total Customers" value={String(stats.totalCustomers)} icon={Users} color="gold" />
        <StatCard label="Products Listed" value={String(stats.totalProducts)} icon={Package} color="charcoal" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard label="Today's Revenue" value={formatPrice(stats.todayRevenue)} icon={TrendingUp} trend={`${stats.todayOrders} orders today`} trendUp color="pink" />
        <StatCard label="Pending Orders" value={String(stats.pendingOrders)} icon={Clock} trend={stats.pendingOrders > 0 ? 'Needs attention' : 'All clear'} trendUp={stats.pendingOrders === 0} color="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-charcoal">Revenue — Last 7 Days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FCE4ED" />
                <XAxis dataKey="date" stroke="#5A4A4A" fontSize={12} />
                <YAxis stroke="#5A4A4A" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(value: number) => formatPrice(value)} contentStyle={{ borderRadius: 12, border: '1px solid #FBC9DC' }} />
                <Bar dataKey="revenue" fill="#CC3F78" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-charcoal">Top Selling Items</h2>
          <div className="mt-4 space-y-3">
            {stats.topProducts.length === 0 && <p className="text-sm text-charcoal-600">No sales data yet.</p>}
            {stats.topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-charcoal">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">{idx + 1}</span>
                  {p.name}
                </span>
                <span className="font-semibold text-charcoal-600">{p.quantity} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-charcoal">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-pink-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 text-charcoal-600">
                  <th className="py-2 pr-4 font-medium">Order #</th>
                  <th className="py-2 pr-4 font-medium">Customer</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-pink-50">
                    <td className="py-3 pr-4 font-medium text-charcoal">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-charcoal-600">{o.customerName}</td>
                    <td className="py-3 pr-4 font-semibold text-charcoal">{formatPrice(o.total)}</td>
                    <td className="py-3"><span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Low Stock Alerts
          </h2>
          <div className="mt-4 space-y-3">
            {stats.lowStock.length === 0 && <p className="text-sm text-charcoal-600">All items well stocked.</p>}
            {stats.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-charcoal line-clamp-1">{p.name}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{p.stock} left</span>
              </div>
            ))}
          </div>
          <Link href="/admin/products" className="btn-secondary mt-4 w-full">Manage Inventory</Link>
        </div>
      </div>
    </div>
  );
}