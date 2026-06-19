import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import AddToCartButton from '@/components/storefront/AddToCartButton';
import ProductCard from '@/components/storefront/ProductCard';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: product.images.length ? [product.images[0]] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isAvailable: true,
    },
    take: 4,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.price,
      availability:
        product.isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 flex items-center gap-2 text-sm text-charcoal-600">
        <Link href="/" className="hover:text-pink-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/menu" className="hover:text-pink-600">Menu</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={'/menu?category=' + product.category.slug} className="hover:text-pink-600">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-pink-50 shadow-sm">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-pink-300 text-5xl">
              🌸
            </div>
          )}
          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <span className="rounded-full bg-charcoal px-5 py-2 text-sm font-bold text-cream">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="section-eyebrow">{product.category.name}</span>
          <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            {product.name}
          </h1>

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge-pistachio capitalize">
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-pink-600">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-base text-charcoal-600/60 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-charcoal-600">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                images: product.images,
              }}
              isAvailable={product.isAvailable && product.stock > 0}
            />
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="mt-3 text-sm font-semibold text-amber-600">
              Only {product.stock} left — order soon!
            </p>
          )}

          <div className="mt-10 rounded-2xl bg-pink-50 p-5 text-sm text-charcoal-600">
            <p className="font-semibold text-charcoal">Pickup or Delivery</p>
            <p className="mt-1">
              Available for pickup from DHA Raya &amp; Gulberg, or delivered across Lahore.
              Free delivery on orders over Rs. 3,000.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-heading mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, compareAtPrice: p.compareAtPrice ?? null }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}