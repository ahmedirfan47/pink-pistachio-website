import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Heart, Leaf, Sparkles, Award } from 'lucide-react';
import { BRANCHES } from '@/lib/constants';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The story behind Pink Pistachio — a boutique café and patisserie in Lahore inspired by European bakeries, pretty interiors and seasonal ingredients.',
};

const DEFAULT_ABOUT =
  'Pink Pistachio began with a simple idea: bring a little European patisserie magic to Lahore, wrapped in soft pink and pistachio green. From our kitchens in DHA Raya and Gulberg, we bake fresh every morning — vintage butter cream cakes, flaky croissants, artisanal sourdough, and an all-day menu of brunch, salads, and savoury bites. Every plate is made with the same obsession for detail that goes into our interiors: pretty, considered, and made to be shared.';

export default async function AboutPage() {
  let settings = null;
  try {
    settings = await db.siteSettings.findUnique({ where: { id: 'settings' } });
  } catch {
    // DB unavailable at build time — use defaults
  }

  const aboutText = settings?.aboutText ?? DEFAULT_ABOUT;

  const values = [
    {
      icon: Heart,
      title: 'Made with Love',
      text: 'Every cake, croissant and loaf is baked from scratch, every single day.',
    },
    {
      icon: Leaf,
      title: 'Seasonal & Fresh',
      text: 'Our salads and specials change with the seasons, sourced locally where possible.',
    },
    {
      icon: Sparkles,
      title: 'Pretty by Design',
      text: 'From plating to packaging, every detail is considered — Instagram-ready, always.',
    },
    {
      icon: Award,
      title: 'Patisserie Standards',
      text: 'European baking techniques meet Lahori hospitality and flavours.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-pink-50 py-16">
        <div className="container-px mx-auto max-w-4xl text-center">
          <span className="section-eyebrow">Our Story</span>
          <h1 className="section-heading">
            A Little Pink, a Little Pistachio, a Lot of Love
          </h1>
        </div>
      </section>

      {/* Story section */}
      <section className="container-px mx-auto max-w-5xl py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop"
              alt="Pink Pistachio café interior"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
              From DHA Raya to Gulberg
            </h2>
            <p className="mt-4 leading-relaxed text-charcoal-600">{aboutText}</p>
            <p className="mt-4 leading-relaxed text-charcoal-600">
              Today, our two Lahore locations welcome guests from sunrise to well past
              midnight — for a quiet morning coffee, a long brunch with friends, or a
              late-night slice of cake. Whatever the hour, the pistachio cream is always
              fresh and the cakes are always pretty.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16">
        <div className="container-px mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="section-eyebrow">What We Stand For</span>
            <h2 className="section-heading">Our Values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="card flex flex-col items-center p-6 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                  <v.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-charcoal">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-600">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="container-px mx-auto max-w-6xl py-16">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">Find Us</span>
          <h2 className="section-heading">Two Spots in Lahore</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {BRANCHES.map((b) => (
            <div key={b.id} className="card p-6">
              <h3 className="font-display text-xl font-bold text-charcoal">{b.name}</h3>
              <p className="mt-2 text-sm text-charcoal-600">{b.address}</p>
              <p className="mt-1 text-sm text-charcoal-600">Open {b.hours}</p>
              <p className="mt-1 text-sm text-charcoal-600">{b.phone}</p>
              <a
                href={b.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 inline-flex"
              >
                Get Directions
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal py-16 text-center text-cream">
        <div className="container-px mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold">Hungry already?</h2>
          <p className="mt-3 text-cream/80">
            Browse our full menu and order online for pickup or delivery.
          </p>
          <Link href="/menu" className="btn-primary mt-6 px-8 py-3.5 text-base">
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
}