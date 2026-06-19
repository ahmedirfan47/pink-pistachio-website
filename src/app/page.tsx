import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coffee, Clock, MapPin, Star } from 'lucide-react';
import { db } from '@/lib/db';
import ProductCard from '@/components/storefront/ProductCard';
import { BRANCHES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [heroBanner, featuredProducts, galleryBanners, categories] = await Promise.all([
    db.banner.findFirst({
      where: { type: 'HERO', isActive: true },
      orderBy: { position: 'asc' },
    }),
    db.product.findMany({
      where: { isFeatured: true, isAvailable: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    db.banner.findMany({
      where: { type: 'GALLERY', isActive: true },
      orderBy: { position: 'asc' },
      take: 4,
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      take: 8,
    }),
  ]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 via-cream to-cream">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl animate-floatSlow" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-pistachio-200/40 blur-3xl animate-floatSlow" />

        <div className="container-px relative mx-auto grid max-w-7xl items-center gap-12 py-16 lg:grid-cols-2 lg:py-28">
          {/* Text side */}
          <div className="animate-fadeUp">
            <span className="section-eyebrow">DHA Raya &amp; Gulberg, Lahore</span>
            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              {heroBanner?.title ?? 'Pink Pistachio'}
              <span className="mt-2 block text-pink-600">Baked Fresh, Daily.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-charcoal-600 sm:text-lg">
              {heroBanner?.subtitle ??
                'A boutique cafe and patisserie — specialty coffee, vintage butter cream cakes, artisan bread and all-day brunch, made with love.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/menu" className="btn-primary px-8 py-3.5 text-base">
                Order Online <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="btn-secondary px-8 py-3.5 text-base">
                Our Story
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-charcoal-600">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-semibold text-charcoal">4.8/5</span> rated on FoodPanda
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-pink-500" />
                <span className="font-semibold text-charcoal">40+</span> menu items
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="relative animate-fadeUp">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2.5rem] shadow-2xl ring-8 ring-white">
              <Image
                src={heroBanner?.image ?? 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=900&auto=format&fit=crop'}
                alt="Pink Pistachio signature drink"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="absolute -left-6 -top-6 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <p className="font-display text-2xl font-bold text-pink-600">2,400+</p>
              <p className="text-xs text-charcoal-600">Happy customers monthly</p>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-pistachio-500 p-4 text-white shadow-xl sm:block">
              <p className="font-display text-lg font-bold">Pistachio Latte</p>
              <p className="text-xs opacity-90">Our most-loved signature</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRANCH INFO STRIP ── */}
      <section className="border-y border-pink-100 bg-white">
        <div className="container-px mx-auto grid max-w-7xl gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {BRANCHES.map((b) => (
            <div key={b.id} className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
              <div>
                <p className="text-sm font-semibold text-charcoal">{b.name}</p>
                <p className="text-xs text-charcoal-600">{b.address}</p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
            <div>
              <p className="text-sm font-semibold text-charcoal">Free Delivery</p>
              <p className="text-xs text-charcoal-600">On orders over Rs. 3,000 across Lahore</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Coffee className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
            <div>
              <p className="text-sm font-semibold text-charcoal">Fresh Daily</p>
              <p className="text-xs text-charcoal-600">Croissants and cakes baked every morning</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">Explore</span>
          <h2 className="section-heading">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={'/menu?category=' + cat.slug}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 font-display text-sm font-bold text-white sm:text-base">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-white py-16">
        <div className="container-px mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-eyebrow">Customer Favourites</span>
              <h2 className="section-heading">Bestsellers &amp; Signatures</h2>
            </div>
            <Link href="/menu" className="btn-secondary">
              View Full Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, compareAtPrice: p.compareAtPrice ?? null }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY STRIP ── */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">@pistachio.pink</span>
          <h2 className="section-heading">From Our Counter to Your Feed</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {galleryBanners.map((g) => (
            <div key={g.id} className="group relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={g.image}
                alt={g.title ?? 'Pink Pistachio'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 flex items-end bg-charcoal/0 p-3 opacity-0 transition-opacity group-hover:bg-charcoal/40 group-hover:opacity-100">
                <p className="text-xs font-semibold text-white">{g.title}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="https://www.instagram.com/pistachio.pink"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary">
            Follow us on Instagram
          </a>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-charcoal py-16 text-cream">
        <div className="container-px mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Craving something pink, pistachio &amp; perfect?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/80">
            Order online for delivery across Lahore, or visit us in DHA Raya and Gulberg.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/menu" className="btn-primary px-8 py-3.5 text-base">
              Order Now
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-2 border-cream/30 px-8 py-3.5 text-base font-semibold text-cream transition-colors hover:bg-cream/10">
              Find a Branch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}