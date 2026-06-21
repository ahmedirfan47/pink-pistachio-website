'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Trash2, X, Loader2, ImagePlus, Eye, EyeOff } from 'lucide-react';

interface Banner { id:string; type:string; title:string|null; subtitle:string|null; image:string; link:string|null; position:number; isActive:boolean }
const EMPTY = { type:'HERO', title:'', subtitle:'', image:'', link:'', position:'0', isActive:true };
const TYPES = ['HERO','PROMO','GALLERY'];

export default function BannersClient() {
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState<any>(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const fetchB = useCallback(async () => {
    setLoading(true);
    const data = await fetch('/api/admin/banners').then(r => r.json());
    setBanners(Array.isArray(data) ? data : []); setLoading(false);
  }, []);
  useEffect(() => { fetchB(); }, [fetchB]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method:'POST', body:fd });
    const data = await res.json();
    if (data.url) setForm((f:any) => ({ ...f, image: data.url }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true); setError('');
    const body = { ...form, position: Number(form.position) };
    const res = await fetch('/api/admin/banners', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return; }
    setModal(false); fetchB(); setSaving(false);
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`/api/admin/banners/${b.id}`, { method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...b, isActive: !b.isActive }) });
    fetchB();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/admin/banners/${id}`, { method:'DELETE' }); fetchB();
  };

  const grouped = TYPES.reduce((acc, t) => ({ ...acc, [t]: banners.filter(b => b.type === t) }), {} as Record<string, Banner[]>);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => { setForm(EMPTY); setError(''); setModal(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {TYPES.map(type => (
        <div key={type}>
          <h2 className="mb-3 font-display text-lg font-bold text-charcoal">{type === 'HERO' ? 'Hero Banners' : type === 'PROMO' ? 'Promo Banners' : 'Gallery Images'}</h2>
          {grouped[type]?.length === 0
            ? <p className="text-sm text-charcoal-600">No {type.toLowerCase()} banners yet.</p>
            : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {grouped[type].map(b => (
                  <div key={b.id} className={`relative overflow-hidden rounded-2xl border-2 ${b.isActive ? 'border-pistachio-300' : 'border-pink-100 opacity-60'}`}>
                    <div className="relative aspect-video"><Image src={b.image} alt={b.title??''} fill className="object-cover" /></div>
                    {b.title && <p className="px-2 py-1.5 text-xs font-medium text-charcoal line-clamp-1">{b.title}</p>}
                    <div className="flex gap-1 px-2 pb-2">
                      <button onClick={() => toggleActive(b)} className="flex-1 rounded-lg bg-pink-50 px-2 py-1 text-xs font-medium text-charcoal-600 hover:bg-pink-100">
                        {b.isActive ? <><EyeOff className="mr-1 inline h-3 w-3" />Hide</> : <><Eye className="mr-1 inline h-3 w-3" />Show</>}
                      </button>
                      <button onClick={() => del(b.id)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      ))}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-hover">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">Add Banner</h2>
              <button onClick={() => setModal(false)} className="rounded-xl p-2 hover:bg-pink-50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label-field">Type</label>
                <select value={form.type} onChange={e => setForm((f:any)=>({...f,type:e.target.value}))} className="input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="label-field">Title</label><input value={form.title} onChange={e => setForm((f:any)=>({...f,title:e.target.value}))} className="input-field" /></div>
              <div><label className="label-field">Subtitle</label><input value={form.subtitle} onChange={e => setForm((f:any)=>({...f,subtitle:e.target.value}))} className="input-field" /></div>
              <div><label className="label-field">Link (optional)</label><input value={form.link} onChange={e => setForm((f:any)=>({...f,link:e.target.value}))} className="input-field" placeholder="/menu" /></div>
              <div><label className="label-field">Position</label><input type="number" value={form.position} onChange={e => setForm((f:any)=>({...f,position:e.target.value}))} className="input-field" /></div>
              <div>
                <label className="label-field">Image</label>
                {form.image && <div className="relative mb-2 aspect-video overflow-hidden rounded-2xl"><Image src={form.image} alt="" fill className="object-cover" /></div>}
                <label className="flex w-fit cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-pink-200 px-4 py-2 text-sm hover:border-pink-400">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button onClick={save} disabled={saving||!form.image} className="btn-primary flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add Banner
                </button>
                <button onClick={() => setModal(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}