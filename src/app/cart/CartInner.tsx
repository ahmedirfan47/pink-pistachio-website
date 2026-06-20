'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CartInner() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = items.reduce((n, i) => n + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto flex max-w-3xl flex-col items-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-pink-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-charcoal">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-charcoal-600">
          Looks like you haven&apos;t added anything yet. Let&apos;s fix that.
        </p>
        <Link href="/menu" className="btn-primary mt-6">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-5xl py-12">
      <h1 className="section-heading mb-8">Your Cart</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-pink-50 sm:h-24 sm:w-24">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display text-sm font-semibold text-charcoal hover:text-pink-600 sm:text-base line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-charcoal-600/50 transition-colors hover:text-red-600"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 rounded-full border border-pink-200 px-2 py-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-pink-600 hover:bg-pink-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-pink-600 hover:bg-pink-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-semibold text-pink-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card h-fit p-6">
          <h2 className="font-display text-lg font-bold text-charcoal">
            Order Summary
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold text-charcoal">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Delivery</span>
              <span className="text-pistachio-600 font-medium">
                {subtotal >= 3000 ? 'Free' : 'Calculated at checkout'}
              </span>
            </div>
            {subtotal < 3000 && (
              <p className="rounded-xl bg-pistachio-50 px-3 py-2 text-xs text-pistachio-700">
                Add{' '}
                <span className="font-semibold">
                  {formatPrice(3000 - subtotal)}
                </span>{' '}
                more for free delivery
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-pink-100 pt-4 text-base font-bold text-charcoal">
            <span>Subtotal</span>
            <span className="text-pink-600">{formatPrice(subtotal)}</span>
          </div>

          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/menu" className="btn-secondary mt-3 w-full">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}