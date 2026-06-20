import { db } from '@/lib/db';
import ProductCard from '@/components/storefront/ProductCard';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Browse the full Pink Pistachio menu — specialty coffee, croissants, vintage cakes, artisan bread, brunch, sandwiches and more.',
};

interface MenuPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { category, q } = await searchParams;

  const categories = await db.category.findMany({
    where:   { isActive: true },
    orderBy: { position: 'asc' },
  });

  const activeCategory = category
    ? (categories.find((c) => c.slug === category) ?? null)
    : null;

  const products = await db.product.findMany({
    where: {
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
      ...(q
        ? {
            OR: [
              { name:        { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { tags:        { hasSome:  [q.toLowerCase()]       } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
    include: { category: true },
  });

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <div className="mb-10 text-center">
        <span className="section-eyebrow">Our Menu</span>
        <h1 className="section-heading">
          {activeCategory ? activeCategory.name : 'Everything Pink Pistachio'}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-charcoal-600 sm:text-base">
          {activeCategory?.description ??
            'Specialty coffee, artisan bread, vintage cakes, croissants and an all-day brunch menu — baked fresh in our Lahore kitchens.'}
        </p>
      </div>

      {/* Search */}
      <form action="/menu" method="GET" className="mx-auto mb-8 max-w-md">
        {category && (
          <input type="hidden" name="category" value={category} />
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search the menu (e.g. pistachio, latte, cake)"
            className="input-field pl-11"
          />
        </div>
      </form>

      {/* Category chips */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <Link
          href="/menu"
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            !category
              ? 'bg-pink-600 text-white'
              : 'bg-pink-50 text-charcoal hover:bg-pink-100'
          )}
        >
          All Items
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/menu?category=${c.slug}`}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              category === c.slug
                ? 'bg-pink-600 text-white'
                : 'bg-pink-50 text-charcoal hover:bg-pink-100'
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Results count */}
      {(activeCategory || q) && products.length > 0 && (
        <p className="mb-6 text-sm text-charcoal-600">
          Showing{' '}
          <span className="font-semibold text-charcoal">{products.length}</span>{' '}
          {products.length === 1 ? 'item' : 'items'}
          {activeCategory && ` in ${activeCategory.name}`}
          {q && ` matching "${q}"`}
          {' — '}
          <Link href="/menu" className="text-pink-600 hover:underline">
            Clear
          </Link>
        </p>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 py-16 text-center text-charcoal-600">
          No items found.{' '}
          <Link href="/menu" className="font-semibold text-pink-600 hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{ ...p, compareAtPrice: p.compareAtPrice ?? null }}
            />
          ))}
        </div>
      )}
    </div>
  );
}