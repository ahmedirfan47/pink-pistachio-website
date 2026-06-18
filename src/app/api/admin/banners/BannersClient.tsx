'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/admin/ImageUploader';

interface Banner {
  id: string; type: 'HERO' | 'PROMO' | 'GALLERY'; title: string | null; subtitle: string | null;
  image: string; link: string | null; position: number; isActive: boolean;
}

const TABS: { value: Banner['type']; label: string }[] = [
  { value: 'HERO', label: 'Hero Banners' },
  { value: 'PROMO', label: 'Promo Banners' },
  { value: 'GALLERY', label: 'Gallery' },
];

const emptyForm = { type: 'HERO' as Banner['type'], title: '', subtitle: '', image: '', link: '', position: 0, isActive: true };

export default function BannersClient() {
  const [tab, setTab] = useState<Banner['type']>('HERO');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBanners = async (type: Banner['type']) => {
    setLoading(true);
    const res = await fetch(`/api/admin/banners?type=${type}`);
    setBanners(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchBanners(tab); }, [tab]);

  const handleSave = async () => {
    if (!form.image) { setError('Please upload an image'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setModalOpen(false);
      fetchBanners(tab);
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...b, isActive: !b.isActive }),
    });
    fetchBanners(tab);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner/image?')) return;
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    fetchBanners(tab);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)} className={cn('rounded-full px-4 py-2 text-sm font-medium', tab === t.value ? 'bg-pink-600 text-white' : 'bg-pink-50 text-charcoal hover:bg-pink-100')}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => { setForm({ ...emptyForm, type: tab, position: banners.length + 1 }); setError(''); setModalOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add {TABS.find((t) => t.value === tab)?.label.replace(/s$/, '')}
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-pink-500" /></div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 py-16 text-center text-charcoal-600">No items yet — add your first one.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="relative h-40 bg-pink-50">
                <Image src={b.image} alt={b.title || 'Banner'} fill className="object-cover" />
              </div>
              <div className="p-4">
                {b.title && <p className="font-display text-base font-bold text-charcoal">{b.title}</p>}
                {b.subtitle && <p className="text-sm text-charcoal-600">{b.subtitle}</p>}
                <p className="mt-1 text-xs text-charcoal-600">Position {b.position}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggleActive(b)} className={cn('flex-1 rounded-full px-3 py-1.5 text-xs font-semibold', b.isActive ? 'bg-pistachio-100 text-pistachio-600' : 'bg-red-100 text-red-600')}>
                    {b.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">Add {TABS.find((t) => t.value === form.type)?.label.replace(/s$/, '')}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-pink-50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <ImageUploader images={form.image ? [form.image] : []} onChange={(images) => setForm((f) => ({ ...f, image: images[0] || '' }))} label="Image" />
              <div>
                <label className="label-field">Title (optional)</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Subtitle (optional)</label>
                <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Link (optional)</label>
                <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className="input-field" placeholder="/menu" />
              </div>
              <div>
                <label className="label-field">Position</label>
                <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))} className="input-field" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}