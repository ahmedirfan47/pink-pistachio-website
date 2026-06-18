'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Loader2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category {
  id: string; name: string; slug: string; description: string | null; image: string | null;
  position: number; isActive: boolean; _count?: { products: number };
}

const emptyForm = { name: '', slug: '', description: '', image: null as string | null, position: 0, isActive: true };

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/categories');
    setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, position: categories.length + 1 });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image, position: c.position, isActive: c.isActive });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const payload = { ...form, image: form.image?.[0] ? form.image : (Array.isArray(form.image) ? null : form.image) };
    try {
      const url = editing ? `/api/admin/categories/${editing}` : '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setModalOpen(false);
      fetchCategories();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Could not delete category'); return; }
    fetchCategories();
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add Category</button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-pink-500" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <div className="relative h-32 bg-pink-50">
                {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" />}
                <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-charcoal-600">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-charcoal">{c.name}</h3>
                    <p className="text-xs text-charcoal-600">{c._count?.products ?? 0} products · Position {c.position}</p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', c.isActive ? 'bg-pistachio-100 text-pistachio-600' : 'bg-red-100 text-red-600')}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-charcoal-600 line-clamp-2">{c.description}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(c)} className="btn-secondary flex-1 px-3 py-2 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="font-display text-xl font-bold text-charcoal">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-pink-50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field">Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="input-field" />
              </div>
              <ImageUploader
                images={form.image ? [form.image] : []}
                onChange={(images) => setForm((f) => ({ ...f, image: images[0] || null }))}
                label="Category Image"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Position (display order)</label>
                  <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))} className="input-field" />
                </div>
                <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-charcoal">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-pink-600" />
                  Visible on website
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}