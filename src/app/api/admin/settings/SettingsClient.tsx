'use client';
import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

export default function SettingsClient() {
  const [form,    setForm]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => { setForm(data); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true); setSaved(false);
    await fetch('/api/admin/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const field = (key: string, label: string, type='text', placeholder='') => (
    <div>
      <label className="label-field">{label}</label>
      <input type={type} value={form?.[key]??''} onChange={e => setForm((f:any) => ({...f, [key]: type==='number' ? Number(e.target.value) : e.target.value}))}
        className="input-field" placeholder={placeholder} />
    </div>
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Site Info</h2>
        <div className="space-y-4">
          {field('siteName', 'Site Name', 'text', 'Pink Pistachio')}
          {field('tagline', 'Tagline', 'text', 'Boutique Café & Patisserie')}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('primaryPhone', 'Phone')}
          {field('primaryEmail', 'Email')}
          {field('whatsappNumber', 'WhatsApp Number')}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Delivery Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('deliveryFee', 'Delivery Fee (Rs)', 'number')}
          {field('freeDeliveryMin', 'Free Delivery Above (Rs)', 'number')}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Social Links</h2>
        <div className="space-y-4">
          {field('instagramUrl', 'Instagram URL')}
          {field('facebookUrl', 'Facebook URL')}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">About Text</h2>
        <textarea value={form?.aboutText??''} onChange={e => setForm((f:any) => ({...f, aboutText: e.target.value}))}
          rows={5} className="input-field" placeholder="About Pink Pistachio..." />
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}