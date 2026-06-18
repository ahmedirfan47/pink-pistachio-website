'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  isAvailable: boolean;
}

export default function AddToCartButton({ product, isAvailable }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0] || null,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!isAvailable) {
    return (
      <button disabled className="btn-dark w-full opacity-50">
        Currently Unavailable
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center justify-between gap-4 rounded-full border-2 border-pink-200 px-2 py-2 sm:w-40">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-pink-600 transition-colors hover:bg-pink-50"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-base font-semibold text-charcoal">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-pink-600 transition-colors hover:bg-pink-50"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button onClick={handleAdd} className="btn-primary flex-1">
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {added ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
}