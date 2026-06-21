'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Loader2, ImagePlus } from 'lucide-react';

interface Category {
  id: string; name: string; slug: string;
  description?: string; image?: string; position: number; isActive: boolean;
}
const EMPTY = { name: '', slug: '', description: '', image: '', position: '0', isActive: true };

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [form,       setForm]       = useState<any>(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState('');

  const fetchC = useCallback(async () => {
    setLoading(true);
    const data = await fetch('/api/admin/categories').then(r => r.json());
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchC(); }, [fetchC]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
  const openEdit   = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '',
      image: c.image ?? '', position: String(c.position), isActive: c.isActive });
    setError(''); setModal(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm((f: any) => ({ ...f, image: data.url }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true); setError('');
    const body   = { ...form, position: Number(form.position) };
    const url    = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
    const method = editing ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data   = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return; }
    setModal(false); fetchC(); setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this category? This will fail if products exist in it.')) return;
    const res  = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    fetchC();
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50/80">
              <tr className="text-xs uppercase tracking-wide text-charcoal-600">
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Position</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-14 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                </td></tr>
              ) : categories.map(c => (
                <tr key={c.id} className="border-b border-pink-50 hover:bg-pink-50/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.image && (
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                          <Image src={c.image} alt={c.name} fill className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium text-charcoal">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-600">{c.slug}</td>
                  <td className="px-4 py-3 text-charcoal-600">{c.position}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.isActive ? 'bg-pistachio-100 text-pistachio-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-charcoal-600 hover:bg-pink-100 hover:text-pink-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => del(c.id)} className="rounded-lg p-1.5 text-charcoal-600 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setModal(false)} className="rounded-xl p-2 hover:bg-pink-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-field">Name</label>
                <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Slug</label>
                <input value={form.slug} onChange={e => setForm((f: any) => ({ ...f, slug: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className="input-field" />
              </div>
              <div>
                <label className="label-field">Sort Position</label>
                <input type="number" value={form.position} onChange={e => setForm((f: any) => ({ ...f, position: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Image</label>
                {form.image && (
                  <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-2xl">
                    <Image src={form.image} alt="" fill className="object-cover" />
                  </div>
                )}
                <label className="flex w-fit cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-pink-200 px-4 py-2 text-sm text-charcoal-600 hover:border-pink-400">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Upload Image
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                </label>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-pink-600" />
                Active (visible on storefront)
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button onClick={save} disabled={saving} className="btn-primary flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Category'}
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