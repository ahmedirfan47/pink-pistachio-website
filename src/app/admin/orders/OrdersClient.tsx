'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X, Loader2, Package, Download, RefreshCw } from 'lucide-react';
import {
  formatPrice,
  formatDate,
  ORDER_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
  cn,
} from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  deliveryType: string;
  address: string | null;
  area: string | null;
  city: string | null;
  branch: string | null;
  paymentMethod: string;
  couponCode: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

const AUTO_REFRESH_INTERVAL = 60_000;

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      try {
        const res = await fetch('/api/admin/orders?' + params.toString(), {
          cache: 'no-store',
        });
        const data = await res.json();
        setOrders(data);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchOrders(false), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, statusFilter, fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const res = await fetch('/api/admin/orders/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
    } else {
      alert(data.error ?? 'Could not update status');
    }
    setUpdating(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch('/api/admin/orders/export?' + params.toString());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        'pink-pistachio-orders-' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  // Build detail rows for the selected order modal — fully typed, no filter(Boolean)
  function buildDetailRows(order: Order): { label: string; value: string }[] {
    const rows: { label: string; value: string }[] = [
      { label: 'Customer', value: order.customerName },
      { label: 'Email',    value: order.customerEmail },
      { label: 'Phone',    value: order.customerPhone },
      { label: 'Payment',  value: order.paymentMethod.replace(/_/g, ' ') },
      {
        label: 'Fulfilment',
        value:
          order.deliveryType === 'pickup'
            ? 'Pickup — ' + (order.branch ?? '')
            : 'Delivery — ' +
              [order.address, order.area, order.city]
                .filter((v): v is string => Boolean(v))
                .join(', '),
      },
    ];
    if (order.notes) {
      rows.push({ label: 'Notes', value: order.notes });
    }
    return rows;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order #, name, email, phone..."
            className="input-field w-64 pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-44"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="btn-ghost border border-pink-200 px-3 py-2.5"
          title="Refresh"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary ml-auto px-4 py-2.5"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export CSV
        </button>
      </div>

      {/* Stats strip */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="card-flat flex items-center gap-2 px-4 py-2.5 text-sm">
          <span className="text-charcoal-600 font-medium">Total:</span>
          <span className="font-bold text-charcoal">{orders.length}</span>
        </div>
        {pendingCount > 0 && (
          <div className="card-flat flex items-center gap-2 px-4 py-2.5 text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span className="font-semibold text-amber-700">{pendingCount} Pending</span>
          </div>
        )}
        <p className="ml-auto text-xs text-charcoal-600/50">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50/80">
              <tr className="text-xs uppercase tracking-wide text-charcoal-600">
                <th className="px-4 py-3 font-semibold">Order #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-charcoal-600">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-pink-50 transition-colors hover:bg-pink-50/30"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-charcoal">
                        {o.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{o.customerName}</p>
                      <p className="text-xs text-charcoal-600">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-600">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-charcoal">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        disabled={updating}
                        className={cn(
                          'cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none',
                          STATUS_COLORS[o.status]
                        )}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(o)}
                        className="rounded-xl bg-pink-50 p-2 text-pink-600 transition-colors hover:bg-pink-100"
                      >
                        <Package className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-hover admin-scroll">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal">
                  {selected.orderNumber}
                </h2>
                <p className="text-xs text-charcoal-600">{formatDate(selected.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 hover:bg-pink-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status updater */}
            <div className="mb-4">
              <label className="label-field">Update Status</label>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                disabled={updating}
                className={cn(
                  'w-full cursor-pointer rounded-2xl border px-3 py-2.5 text-sm font-semibold focus:outline-none',
                  STATUS_COLORS[selected.status]
                )}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Detail rows — fully typed array, no filter(Boolean) destructure */}
            <div className="space-y-1.5 text-sm">
              {buildDetailRows(selected).map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <span className="w-24 shrink-0 font-semibold text-charcoal">{label}:</span>
                  <span className="text-charcoal-600">{value}</span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="mt-5 space-y-2 border-t border-pink-100 pt-4">
              <p className="text-sm font-semibold text-charcoal">Items</p>
              {selected.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-1.5 border-t border-pink-100 pt-4 text-sm">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span>{formatPrice(selected.subtotal)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-pistachio-600">
                  <span>
                    Discount
                    {selected.couponCode ? ' (' + selected.couponCode + ')' : ''}
                  </span>
                  <span>-{formatPrice(selected.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Delivery</span>
                <span>
                  {selected.deliveryFee === 0 ? 'Free' : formatPrice(selected.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-pink-100 pt-2 text-base font-bold text-charcoal">
                <span>Total</span>
                <span className="text-pink-600">{formatPrice(selected.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}