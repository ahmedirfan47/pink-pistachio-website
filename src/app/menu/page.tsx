import { db } from '@/lib/db';
import ProductCard from '@/components/storefront/ProductCard';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Next.js 15/16: searchParams is a Promise — must be typed and awaited
interface MenuPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: MenuPageProps): Promise<Metadata> {
  const { category } = await searchParams;

  if (!category) {
    return {
      title: 'Menu',
      description:
        'Browse the full Pink Pistachio menu — specialty coffee, croissants, vintage cakes, artisan bread, brunch, sandwiches and more.',
    };
  }

  const cat = await db.category.findUnique({
    where: { slug: category },
    select: { name: true, description: true },
  });

  return {
    title: cat?.name ?? 'Menu',
    description:
      cat?.description ??
      'Browse the full Pink Pistachio menu — baked fresh in our Lahore kitchens.',
  };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  // Await searchParams — required in Next.js 15/16
  const { category, q } = await searchParams;

  const [categories, products] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    }),
    db.product.findMany({
      where: {
        // Only filter by category if one is provided
        ...(category ? { category: { slug: category } } : {}),
        // Only filter by search if a query is provided
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { tags: { hasSome: [q.toLowerCase()] } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      include: { category: true },
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

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

      {/* Search form */}
      <form action="/menu" method="GET" className="mx-auto mb-8 max-w-md">
        {category && <input type="hidden" name="category" value={category} />}
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

      {/* Category filter chips */}
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

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 py-16 text-center">
          <p className="text-charcoal-600">
            No items found.{' '}
            <Link href="/menu" className="font-semibold text-pink-600 hover:underline">
              Clear filters
            </Link>
          </p>
        </div>
      ) : (
        <>
          {q || category ? (
            <p className="mb-6 text-sm text-charcoal-600">
              Showing{' '}
              <span className="font-semibold text-charcoal">{products.length}</span>{' '}
              {products.length === 1 ? 'item' : 'items'}
              {category && ` in ${activeCategory?.name ?? category}`}
              {q && ` matching "${q}"`}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, compareAtPrice: p.compareAtPrice ?? null }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}