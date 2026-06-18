'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { formatPrice, cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    tags: string[];
    isAvailable: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const tag = product.tags.includes('bestseller')
    ? { label: 'Bestseller', cls: 'bg-pink-600 text-white' }
    : product.tags.includes('signature')
    ? { label: 'Signature', cls: 'bg-pistachio-500 text-white' }
    : product.tags.includes('seasonal')
    ? { label: 'Seasonal', cls: 'bg-gold text-white' }
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.isAvailable) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0] ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <Link
      href={'/product/' + product.slug}
      className="group flex flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
    >
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-200">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-pink-200">
            <span className="text-3xl">🌸</span>
          </div>
        )}

        {/* Tags */}
        {tag && (
          <span className={'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ' + tag.cls}>
            {tag.label}
          </span>
        )}

        {/* Discount badge */}
        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-charcoal px-2 py-1 text-xs font-bold text-cream">
            -{discount}%
          </span>
        )}

        {/* Sold out overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="rounded-full bg-charcoal px-4 py-1.5 text-xs font-bold text-cream">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-1 font-display text-sm font-bold text-charcoal sm:text-base">
          {product.name}
        </h3>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-pink-600 sm:text-lg">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-charcoal-600/50 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.isAvailable}
            aria-label="Add to cart"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200',
              added
                ? 'bg-pistachio-500 text-white scale-110'
                : 'bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white hover:scale-110 active:scale-95',
              !product.isAvailable && 'cursor-not-allowed opacity-30'
            )}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
}