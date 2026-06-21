'use client';
import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';

interface Settings {
  siteName: string; tagline: string; primaryPhone: string;
  primaryEmail: string; whatsappNumber: string; deliveryFee: number;
  freeDeliveryMin: number; instagramUrl: string; facebookUrl: string; aboutText: string;
}

export default function SettingsClient() {
  const [form,    setForm]    = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { setForm(data); setLoading(false); });
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => f ? { ...f, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : f);

  const save = async () => {
    setSaving(true); setSaved(false);
    await fetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Site Info</h2>
        <div className="space-y-4">
          <div>
            <label className="label-field">Site Name</label>
            <input value={form?.siteName ?? ''} onChange={set('siteName')} className="input-field" placeholder="Pink Pistachio" />
          </div>
          <div>
            <label className="label-field">Tagline</label>
            <input value={form?.tagline ?? ''} onChange={set('tagline')} className="input-field" placeholder="Boutique Café & Patisserie" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Phone</label>
            <input value={form?.primaryPhone ?? ''} onChange={set('primaryPhone')} className="input-field" placeholder="+92 300 1234567" />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input value={form?.primaryEmail ?? ''} onChange={set('primaryEmail')} className="input-field" placeholder="hello@pinkpistachio.pk" />
          </div>
          <div>
            <label className="label-field">WhatsApp Number</label>
            <input value={form?.whatsappNumber ?? ''} onChange={set('whatsappNumber')} className="input-field" placeholder="+92 300 1234567" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Delivery Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Delivery Fee (Rs)</label>
            <input type="number" value={form?.deliveryFee ?? 150} onChange={set('deliveryFee')} className="input-field" />
          </div>
          <div>
            <label className="label-field">Free Delivery Above (Rs)</label>
            <input type="number" value={form?.freeDeliveryMin ?? 3000} onChange={set('freeDeliveryMin')} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Social Links</h2>
        <div className="space-y-4">
          <div>
            <label className="label-field">Instagram URL</label>
            <input value={form?.instagramUrl ?? ''} onChange={set('instagramUrl')} className="input-field" placeholder="https://instagram.com/pistachio.pink" />
          </div>
          <div>
            <label className="label-field">Facebook URL</label>
            <input value={form?.facebookUrl ?? ''} onChange={set('facebookUrl')} className="input-field" placeholder="https://facebook.com/..." />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">About Text</h2>
        <textarea
          value={form?.aboutText ?? ''} onChange={set('aboutText')}
          rows={5} className="input-field"
          placeholder="Tell your story — this appears on the About page..."
        />
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        : saved   ? <><CheckCircle2 className="h-4 w-4" /> Saved!</>
        : <><Save className="h-4 w-4" /> Save Settings</>}
      </button>
    </div>
  );
}