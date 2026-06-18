'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, X, Loader2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category { id: string; name: string }

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  categoryId: string;
  category: { id: string; name: string };
  isFeatured: boolean;
  isAvailable: boolean;
  stock: number;
  sku: string | null;
  tags: string[];
}

const emptyForm = {
  name: '', slug: '', description: '', price: 0, compareAtPrice: null as number | null,
  categoryId: '', images: [] as string[], isFeatured: false, isAvailable: true, stock: 50, sku: '', tags: [] as string[],
};

export default function ProductsClient({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setTagsInput('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p.id);
    setForm({
      name: p.name, slug: p.slug, description: p.description, price: p.price,
      compareAtPrice: p.compareAtPrice, categoryId: p.categoryId, images: p.images,
      isFeatured: p.isFeatured, isAvailable: p.isAvailable, stock: p.stock, sku: p.sku || '', tags: p.tags,
    });
    setTagsInput(p.tags.join(', '));
    setError('');
    setModalOpen(true);
  };

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      tags: tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      compareAtPrice: form.compareAtPrice || null,
      sku: form.sku || null,
    };

    try {
      const url = editing ? `/api/admin/products/${editing}` : '/api/admin/products';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setModalOpen(false);
      fetchProducts();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Could not delete product'); return; }
    fetchProducts();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field w-64 pl-11" />
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add Product</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50">
              <tr className="text-charcoal-600">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-charcoal-600"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-charcoal-600">No products found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-pink-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-pink-50">
                          {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{p.name}</p>
                          {p.isFeatured && <span className="text-[10px] font-semibold uppercase text-pink-500">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{p.category.name}</td>
                    <td className="px-4 py-3 font-medium text-charcoal">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('font-medium', p.stock <= 5 ? 'text-amber-600' : 'text-charcoal')}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', p.isAvailable ? 'bg-pistachio-100 text-pistachio-600' : 'bg-red-100 text-red-600')}>
                        {p.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="rounded-lg bg-pink-50 p-2 text-pink-600 hover:bg-pink-100"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-pink-50"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} className="input-field" />
                </div>
              </div>

              <div>
                <label className="label-field">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-field" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label-field">Price (Rs.)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Compare-at Price</label>
                  <input type="number" value={form.compareAtPrice ?? ''} onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value ? Number(e.target.value) : null }))} className="input-field" placeholder="Optional" />
                </div>
                <div>
                  <label className="label-field">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} className="input-field" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="input-field">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">SKU (optional)</label>
                  <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input-field" />
                </div>
              </div>

              <div>
                <label className="label-field">Tags (comma separated — e.g. signature, bestseller, seasonal)</label>
                <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-field" />
              </div>

              <ImageUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} label="Product Image" />

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="h-4 w-4 accent-pink-600" />
                  Featured on homepage
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} className="h-4 w-4 accent-pink-600" />
                  Available for order
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}