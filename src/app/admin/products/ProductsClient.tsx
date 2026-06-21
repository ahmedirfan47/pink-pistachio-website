'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, X, Loader2, ImagePlus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string; name: string; slug: string; price: number;
  images: string[]; isAvailable: boolean; isFeatured: boolean;
  stock: number; category: { name: string };
}

const EMPTY = {
  name: '', slug: '', description: '', price: '', compareAtPrice: '',
  categoryId: '', stock: '50', sku: '', tags: '',
  isFeatured: false, isAvailable: true, images: [] as string[],
};

export default function ProductsClient() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [categories,   setCategories]   = useState<{ id: string; name: string }[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [modal,        setModal]        = useState(false);
  const [editing,      setEditing]      = useState<Product | null>(null);
  const [form,         setForm]         = useState<any>(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [error,        setError]        = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch(`/api/admin/products?q=${search}`).then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]);
    setProducts(Array.isArray(p) ? p : []);
    setCategories(Array.isArray(c) ? c : []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setError(''); setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug,
      description: (p as any).description ?? '',
      price: String(p.price),
      compareAtPrice: String((p as any).compareAtPrice ?? ''),
      categoryId: (p as any).categoryId ?? '',
      stock: String(p.stock), sku: (p as any).sku ?? '',
      tags: (p as any).tags?.join(', ') ?? '',
      isFeatured: p.isFeatured, isAvailable: p.isAvailable,
      images: p.images,
    });
    setError(''); setModal(true);
  };

  const uploadImage = async (file: File) => {
    setImgUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm((f: any) => ({ ...f, images: [...f.images, data.url] }));
    setImgUploading(false);
  };

  const removeImage = (idx: number) =>
    setForm((f: any) => ({ ...f, images: f.images.filter((_: any, i: number) => i !== idx) }));

  const save = async () => {
    setSaving(true); setError('');
    const body = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock),
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };
    const url    = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
    const method = editing ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return; }
    setModal(false); fetchProducts(); setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..." className="input-field w-60 pl-11"
          />
        </div>
        <button onClick={openCreate} className="btn-primary ml-auto">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50/80">
              <tr className="text-xs uppercase tracking-wide text-charcoal-600">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-14 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-14 text-center text-charcoal-600">No products found.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-pink-50 hover:bg-pink-50/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{p.name}</p>
                        {p.isFeatured && <span className="text-xs font-medium text-pink-500">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold text-charcoal">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-charcoal'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isAvailable ? 'bg-pistachio-100 text-pistachio-700' : 'bg-red-100 text-red-700'}`}>
                      {p.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-charcoal-600 hover:bg-pink-100 hover:text-pink-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="rounded-lg p-1.5 text-charcoal-600 hover:bg-red-50 hover:text-red-600">
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setModal(false)} className="rounded-xl p-2 hover:bg-pink-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Name</label>
                  <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Product name" />
                </div>
                <div>
                  <label className="label-field">Slug</label>
                  <input value={form.slug} onChange={e => setForm((f: any) => ({ ...f, slug: e.target.value }))} className="input-field" placeholder="product-slug" />
                </div>
              </div>

              <div>
                <label className="label-field">Description</label>
                <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} className="input-field" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label-field">Price (Rs)</label>
                  <input type="number" value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Compare Price</label>
                  <input type="number" value={form.compareAtPrice} onChange={e => setForm((f: any) => ({ ...f, compareAtPrice: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm((f: any) => ({ ...f, stock: e.target.value }))} className="input-field" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Category</label>
                  <select value={form.categoryId} onChange={e => setForm((f: any) => ({ ...f, categoryId: e.target.value }))} className="input-field">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">SKU</label>
                  <input value={form.sku} onChange={e => setForm((f: any) => ({ ...f, sku: e.target.value }))} className="input-field" placeholder="Optional" />
                </div>
              </div>

              <div>
                <label className="label-field">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm((f: any) => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="bestseller, signature, seasonal" />
              </div>

              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm((f: any) => ({ ...f, isAvailable: e.target.checked }))} className="h-4 w-4 accent-pink-600" />
                  Available for order
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm((f: any) => ({ ...f, isFeatured: e.target.checked }))} className="h-4 w-4 accent-pink-600" />
                  Featured on homepage
                </label>
              </div>

              <div>
                <label className="label-field">Images</label>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img: string, i: number) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-pink-100">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal/70 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-400">
                    {imgUploading
                      ? <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
                      : <ImagePlus className="h-5 w-5 text-pink-400" />}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                  </label>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="btn-primary flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Product'}
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