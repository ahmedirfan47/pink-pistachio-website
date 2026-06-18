'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, Mail, Phone } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface Customer {
  id: string; name: string; email: string; phone: string | null;
  createdAt: string; totalOrders: number; totalSpent: number;
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/customers?q=${encodeURIComponent(search)}`)
        .then((r) => r.json())
        .then(setCustomers)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="input-field w-72 pl-11" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50">
              <tr className="text-charcoal-600">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-pink-500" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-charcoal-600">No customers found.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-pink-50">
                    <td className="px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 font-display text-sm font-bold text-pink-600 mr-3 float-left">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-charcoal">{c.name}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">
                      <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{c.email}</p>
                      {c.phone && <p className="mt-0.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-charcoal">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold text-pink-600">{formatPrice(c.totalSpent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}