'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Loader2, Tag } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

interface Coupon {
  id: string; code: string; type: 'PERCENTAGE' | 'FIXED'; value: number;
  minOrderAmount: number; maxUses: number | null; usedCount: number;
  isActive: boolean; expiresAt: string | null;
}

const emptyForm = { code: '', type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED', value: 10, minOrderAmount: 0, maxUses: '' as string | number, isActive: true, expiresAt: '' };

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/coupons');
    setCoupons(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, maxUses: form.maxUses === '' ? null : Number(form.maxUses), expiresAt: form.expiresAt || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setModalOpen(false);
      setForm(emptyForm);
      fetchCoupons();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: c.code, type: c.type, value: c.value, minOrderAmount: c.minOrderAmount, maxUses: c.maxUses, isActive: !c.isActive, expiresAt: c.expiresAt }),
    });
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    fetchCoupons();
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button onClick={() => { setForm(emptyForm); setError(''); setModalOpen(true); }} className="btn-primary"><Plus className="h-4 w-4" /> Add Coupon</button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-pink-500" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600"><Tag className="h-4 w-4" /></div>
                  <p className="font-display text-lg font-bold text-charcoal">{c.code}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <p className="mt-3 text-sm text-charcoal-600">
                {c.type === 'PERCENTAGE' ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                {c.minOrderAmount > 0 && ` · Min order ${formatPrice(c.minOrderAmount)}`}
              </p>
              <p className="text-xs text-charcoal-600">Used {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''} times</p>
              {c.expiresAt && <p className="text-xs text-charcoal-600">Expires {new Date(c.expiresAt).toLocaleDateString()}</p>}
              <button onClick={() => toggleActive(c)} className={cn('mt-3 w-full rounded-full px-3 py-1.5 text-xs font-semibold', c.isActive ? 'bg-pistachio-100 text-pistachio-600' : 'bg-red-100 text-red-600')}>
                {c.isActive ? 'Active — Click to Disable' : 'Disabled — Click to Enable'}
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">Add Coupon</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-pink-50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field">Code</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-field" placeholder="e.g. PISTACHIO10" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'PERCENTAGE' | 'FIXED' }))} className="input-field">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className="input-field" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Min Order (Rs.)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) }))} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Max Uses (optional)</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} className="input-field" placeholder="Unlimited" />
                </div>
              </div>
              <div>
                <label className="label-field">Expiry Date (optional)</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="input-field" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}