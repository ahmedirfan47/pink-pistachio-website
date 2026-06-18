import { useEffect, useState } from 'react';
import { Search, X, Loader2, Package } from 'lucide-react';
import { formatPrice, formatDate, ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils';

interface OrderItem { id: string; name: string; quantity: number; price: number; image: string | null }
interface Order {
  id: string; orderNumber: string; customerName: string; customerEmail: string; customerPhone: string;
  status: string; total: number; subtotal: number; discount: number; deliveryFee: number;
  deliveryType: string; address: string | null; area: string | null; city: string | null; branch: string | null;
  paymentMethod: string; couponCode: string | null; notes: string | null; createdAt: string; items: OrderItem[];
}

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (selected?.id === id) setSelected({ ...selected, status });
    } else {
      alert(data.error || 'Could not update status');
    }
    setUpdating(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, name, email, phone" className="input-field w-72 pl-11" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50">
              <tr className="text-charcoal-600">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-pink-500" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-charcoal-600">No orders found.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-pink-50">
                    <td className="px-4 py-3 font-medium text-charcoal">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      <p className="text-charcoal">{o.customerName}</p>
                      <p className="text-xs">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-charcoal">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        disabled={updating}
                        className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none', STATUS_COLORS[o.status])}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(o)} className="rounded-lg bg-pink-50 p-2 text-pink-600 hover:bg-pink-100"><Package className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 hover:bg-pink-50"><X className="h-5 w-5" /></button>
            </div>

            <div className="mb-4">
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                disabled={updating}
                className={cn('w-full rounded-full border px-3 py-2 text-sm font-semibold focus:outline-none', STATUS_COLORS[selected.status])}
              >
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            <div className="space-y-1 text-sm text-charcoal-600">
              <p><span className="font-semibold text-charcoal">Customer:</span> {selected.customerName}</p>
              <p><span className="font-semibold text-charcoal">Email:</span> {selected.customerEmail}</p>
              <p><span className="font-semibold text-charcoal">Phone:</span> {selected.customerPhone}</p>
              <p><span className="font-semibold text-charcoal">Payment:</span> {selected.paymentMethod.replace('_', ' ')}</p>
              <p><span className="font-semibold text-charcoal">Fulfilment:</span> {selected.deliveryType === 'pickup' ? `Pickup — ${selected.branch}` : `Delivery — ${selected.address}, ${selected.area}, ${selected.city}`}</p>
              {selected.notes && <p><span className="font-semibold text-charcoal">Notes:</span> {selected.notes}</p>}
            </div>

            <div className="mt-4 space-y-2 border-t border-pink-100 pt-4">
              {selected.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-charcoal">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-pink-100 pt-4 text-sm">
              <div className="flex justify-between text-charcoal-600"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
              {selected.discount > 0 && <div className="flex justify-between text-pistachio-600"><span>Discount{selected.couponCode ? ` (${selected.couponCode})` : ''}</span><span>-{formatPrice(selected.discount)}</span></div>}
              <div className="flex justify-between text-charcoal-600"><span>Delivery</span><span>{selected.deliveryFee === 0 ? 'Free' : formatPrice(selected.deliveryFee)}</span></div>
              <div className="flex justify-between border-t border-pink-100 pt-2 text-base font-bold text-charcoal"><span>Total</span><span className="text-pink-600">{formatPrice(selected.total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}