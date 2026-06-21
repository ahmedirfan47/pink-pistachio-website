'use client';
import { useEffect, useState } from 'react';
import { Search, Loader2, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

interface CustomerOrder { id:string; orderNumber:string; total:number; status:string; createdAt:string }
interface Customer { id:string; name:string; email:string; phone:string|null; createdAt:string; totalOrders:number; totalSpent:number; orders?:CustomerOrder[] }

export default function CustomersClient() {
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [expandedId,  setExpandedId]  = useState<string|null>(null);
  const [orderLoad,   setOrderLoad]   = useState<string|null>(null);

  const fetchC = async (q='') => {
    setLoading(true);
    const data = await fetch(`/api/admin/customers?q=${q}`).then(r => r.json());
    setCustomers(Array.isArray(data) ? data : []); setLoading(false);
  };
  useEffect(() => { const t = setTimeout(() => fetchC(search), 300); return () => clearTimeout(t); }, [search]);

  const loadOrders = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setOrderLoad(id);
    const orders = await fetch(`/api/admin/customers/${id}/orders`).then(r => r.json());
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, orders } : c));
    setOrderLoad(null); setExpandedId(id);
  };

  return (
    <div>
      <div className="mb-6 max-w-sm">
        <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-11" /></div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-pink-50/80">
            <tr className="text-xs uppercase tracking-wide text-charcoal-600">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Spent</th>
              <th className="px-4 py-3 font-semibold">History</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="py-14 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" /></td></tr>
            : customers.map(c => (
              <>
                <tr key={c.id} className="border-b border-pink-50 hover:bg-pink-50/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 font-display text-sm font-bold text-pink-600">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-charcoal">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal-600">
                    <p className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-pink-400" />{c.email}</p>
                    {c.phone && <p className="flex items-center gap-1 mt-0.5"><Phone className="h-3.5 w-3.5 text-pink-400" />{c.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal-600">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pistachio-100 text-sm font-bold text-pistachio-700">{c.totalOrders}</span></td>
                  <td className="px-4 py-3 font-semibold text-pink-600">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => loadOrders(c.id)} className="flex items-center gap-1 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100">
                      {orderLoad === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : expandedId === c.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      Orders
                    </button>
                  </td>
                </tr>
                {expandedId === c.id && c.orders && (
                  <tr key={c.id+'-exp'} className="bg-pink-50/30">
                    <td colSpan={6} className="px-8 py-4">
                      {c.orders.length === 0 ? <p className="text-sm text-charcoal-600">No orders.</p>
                      : <div className="space-y-2">
                          {c.orders.map(o => (
                            <div key={o.id} className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white px-4 py-2.5">
                              <div><p className="font-mono text-xs font-bold text-charcoal">{o.orderNumber}</p><p className="text-xs text-charcoal-600">{formatDate(o.createdAt)}</p></div>
                              <div className="flex items-center gap-3">
                                <span className={'rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + (STATUS_COLORS[o.status]??'')}>{STATUS_LABELS[o.status]??o.status}</span>
                                <span className="font-semibold text-pink-600">{formatPrice(o.total)}</span>
                              </div>
                            </div>
                          ))}
                        </div>}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}