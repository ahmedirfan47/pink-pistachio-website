'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, Mail, Phone, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

interface CustomerOrder {
  id: string; orderNumber: string; total: number; status: string; createdAt: string;
}
interface Customer {
  id: string; name: string; email: string; phone: string | null;
  createdAt: string; totalOrders: number; totalSpent: number;
  orders?: CustomerOrder[];
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState<string | null>(null);

  const fetchCustomers = async (q = '') => {
    setLoading(true);
    const res = await fetch('/api/admin/customers?q=' + encodeURIComponent(q), { cache: 'no-store' });
    setCustomers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadOrders = async (customerId: string) => {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }
    setOrderLoading(customerId);
    const res = await fetch('/api/admin/customers/' + customerId + '/orders');
    if (res.ok) {
      const orders: CustomerOrder[] = await res.json();
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, orders } : c))
      );
    }
    setOrderLoading(null);
    setExpandedId(customerId);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50/80">
              <tr className="text-xs uppercase tracking-wide text-charcoal-600">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Total Spent</th>
                <th className="px-4 py-3 font-semibold">History</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-charcoal-600">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <>
                    <tr key={c.id} className="border-b border-pink-50 transition-colors hover:bg-pink-50/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-pink-100 font-display text-sm font-bold text-pink-600">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-charcoal">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal-600">
                        <p className="flex items-center gap-1.5 text-xs">
                          <Mail className="h-3.5 w-3.5 text-pink-400" /> {c.email}
                        </p>
                        {c.phone && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                            <Phone className="h-3.5 w-3.5 text-pink-400" /> {c.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-charcoal-600">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pistachio-100 text-sm font-bold text-pistachio-700">
                          {c.totalOrders}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-pink-600">{formatPrice(c.totalSpent)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => loadOrders(c.id)}
                          disabled={orderLoading === c.id}
                          className="flex items-center gap-1 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100"
                        >
                          {orderLoading === c.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : expandedId === c.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          Orders
                        </button>
                      </td>
                    </tr>

                    {/* Expanded order history */}
                    {expandedId === c.id && c.orders && (
                      <tr key={c.id + '-expanded'} className="bg-pink-50/30">
                        <td colSpan={6} className="px-8 py-4">
                          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-charcoal">
                            <ShoppingBag className="h-4 w-4 text-pink-500" />
                            Order History — {c.name}
                          </p>
                          {c.orders.length === 0 ? (
                            <p className="text-sm text-charcoal-600">No orders found.</p>
                          ) : (
                            <div className="space-y-2">
                              {c.orders.map((o) => (
                                <div
                                  key={o.id}
                                  className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white px-4 py-2.5"
                                >
                                  <div>
                                    <p className="font-mono text-xs font-bold text-charcoal">{o.orderNumber}</p>
                                    <p className="text-xs text-charcoal-600">{formatDate(o.createdAt)}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={'rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + STATUS_COLORS[o.status]}
                                    >
                                      {STATUS_LABELS[o.status]}
                                    </span>
                                    <span className="font-semibold text-pink-600">{formatPrice(o.total)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}