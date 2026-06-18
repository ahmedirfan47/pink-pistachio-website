'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';

interface Settings {
  siteName: string; tagline: string | null; primaryPhone: string | null; primaryEmail: string | null;
  whatsappNumber: string | null; instagramUrl: string | null; facebookUrl: string | null;
  deliveryFee: number; freeDeliveryMin: number; aboutText: string | null;
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then(setSettings).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-pink-500" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-charcoal">General</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Site Name</label>
            <input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Tagline</label>
            <input value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="input-field" />
          </div>
        </div>
        <div className="mt-4">
          <label className="label-field">About Text (used on About page)</label>
          <textarea value={settings.aboutText || ''} onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })} rows={4} className="input-field" />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-charcoal">Contact &amp; Social</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Primary Phone</label>
            <input value={settings.primaryPhone || ''} onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Primary Email</label>
            <input value={settings.primaryEmail || ''} onChange={(e) => setSettings({ ...settings, primaryEmail: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">WhatsApp Number</label>
            <input value={settings.whatsappNumber || ''} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Instagram URL</label>
            <input value={settings.instagramUrl || ''} onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Facebook URL</label>
            <input value={settings.facebookUrl || ''} onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-charcoal">Delivery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Delivery Fee (Rs.)</label>
            <input type="number" value={settings.deliveryFee} onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Free Delivery Minimum (Rs.)</label>
            <input type="number" value={settings.freeDeliveryMin} onChange={(e) => setSettings({ ...settings, freeDeliveryMin: Number(e.target.value) })} className="input-field" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}