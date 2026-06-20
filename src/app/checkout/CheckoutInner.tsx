'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { checkoutSchema } from '@/lib/validations';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { BRANCHES } from '@/lib/constants';
import { Tag, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/session-context';

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutInner() {
  const router          = useRouter();
  const { session }     = useSession();
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal        = getSubtotal();

  const [deliveryFee,    setDeliveryFee]    = useState(150);
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(3000);
  const [couponInput,    setCouponInput]    = useState('');
  const [couponStatus,   setCouponStatus]   = useState<{
    valid: boolean; message: string; discount: number;
  } | null>(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType:  'delivery',
      paymentMethod: 'COD',
      city:          'Lahore',
      customerName:  '',
      customerEmail: '',
    },
  });

  const deliveryType = watch('deliveryType');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.deliveryFee     !== undefined) setDeliveryFee(data.deliveryFee);
        if (data?.freeDeliveryMin !== undefined) setFreeDeliveryMin(data.freeDeliveryMin);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      setValue('customerName',  session.user.name  ?? '');
      setValue('customerEmail', session.user.email ?? '');
    }
  }, [session, setValue]);

  const effectiveDeliveryFee =
    deliveryType === 'pickup'
      ? 0
      : subtotal >= freeDeliveryMin
      ? 0
      : deliveryFee;

  const discount = couponStatus?.valid ? couponStatus.discount : 0;
  const total    = Math.max(0, subtotal - discount) + effectiveDeliveryFee;

  const applyCoupon = async () => {
    if (!couponInput) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponStatus({ valid: true, message: data.message, discount: data.discount });
        setValue('couponCode', couponInput.toUpperCase());
      } else {
        setCouponStatus({ valid: false, message: data.error, discount: 0 });
        setValue('couponCode', undefined);
      }
    } catch {
      setCouponStatus({ valid: false, message: 'Could not validate coupon', discount: 0 });
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setServerError('');
    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...data,
          items: items.map((i) => ({
            productId: i.productId,
            name:      i.name,
            image:     i.image,
            price:     i.price,
            quantity:  i.quantity,
          })),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Something went wrong placing your order.');
        return;
      }
      clearCart();
      router.push('/order/' + result.orderNumber);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto max-w-2xl py-24 text-center">
        <h1 className="section-heading">Your cart is empty</h1>
        <p className="mt-2 text-charcoal-600">
          Add something delicious before checking out.
        </p>
        <Link href="/menu" className="btn-primary mt-6">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-6xl py-12">
      <h1 className="section-heading mb-8">Checkout</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-10 lg:grid-cols-[1fr_380px]"
      >
        {/* ── Left column ── */}
        <div className="space-y-6">

          {/* Contact */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-charcoal">
              Contact Details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Full Name</label>
                <input
                  {...register('customerName')}
                  className="input-field"
                  placeholder="Your name"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.customerName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label-field">Email</label>
                <input
                  {...register('customerEmail')}
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Phone Number</label>
                <input
                  {...register('customerPhone')}
                  className="input-field"
                  placeholder="03XX XXXXXXX"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery method */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-charcoal">
              Delivery Method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                className={
                  'flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-colors ' +
                  (deliveryType === 'delivery'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-pink-100')
                }
              >
                <input
                  type="radio"
                  value="delivery"
                  {...register('deliveryType')}
                  className="h-4 w-4 accent-pink-600"
                />
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    Home Delivery
                  </p>
                  <p className="text-xs text-charcoal-600">
                    Delivered across Lahore
                  </p>
                </div>
              </label>
              <label
                className={
                  'flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-colors ' +
                  (deliveryType === 'pickup'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-pink-100')
                }
              >
                <input
                  type="radio"
                  value="pickup"
                  {...register('deliveryType')}
                  className="h-4 w-4 accent-pink-600"
                />
                <div>
                  <p className="text-sm font-semibold text-charcoal">Pickup</p>
                  <p className="text-xs text-charcoal-600">
                    Free — collect from branch
                  </p>
                </div>
              </label>
            </div>

            {deliveryType === 'delivery' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-field">Street Address</label>
                  <input
                    {...register('address')}
                    className="input-field"
                    placeholder="House #, Street, Block"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-field">Area</label>
                  <input
                    {...register('area')}
                    className="input-field"
                    placeholder="e.g. DHA Phase 6"
                  />
                </div>
                <div>
                  <label className="label-field">City</label>
                  <input
                    {...register('city')}
                    className="input-field"
                    defaultValue="Lahore"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <label className="label-field">Pickup Branch</label>
                <select {...register('branch')} className="input-field">
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} — {b.address}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-charcoal">
              Payment Method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { value: 'COD',           label: 'Cash on Delivery' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer'    },
                { value: 'CARD',          label: 'Card (at branch)' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-pink-100 p-3 text-sm has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('paymentMethod')}
                    className="h-4 w-4 accent-pink-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <label className="label-field">Order Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input-field"
              placeholder="e.g. Less sugar, ring the bell, etc."
            />
          </div>
        </div>

        {/* ── Right column — summary ── */}
        <div className="card h-fit space-y-4 p-6">
          <h2 className="font-display text-lg font-bold text-charcoal">
            Order Summary
          </h2>

          {/* Items */}
          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-charcoal">
                    {item.name}
                  </p>
                  <p className="text-xs text-charcoal-600">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-charcoal">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="border-t border-pink-100 pt-4">
            <label className="label-field">Coupon Code</label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="input-field"
                placeholder="e.g. PISTACHIO10"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="btn-secondary px-4"
              >
                <Tag className="h-4 w-4" />
              </button>
            </div>
            {couponStatus && (
              <p
                className={
                  'mt-2 text-xs font-semibold ' +
                  (couponStatus.valid ? 'text-pistachio-600' : 'text-red-600')
                }
              >
                {couponStatus.message}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-pink-100 pt-4 text-sm">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span className="font-medium text-charcoal">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-pistachio-600">
                <span>Discount</span>
                <span className="font-medium">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-600">
              <span>Delivery Fee</span>
              <span className="font-medium text-charcoal">
                {effectiveDeliveryFee === 0
                  ? 'Free'
                  : formatPrice(effectiveDeliveryFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-pink-100 pt-2 text-base font-bold text-charcoal">
              <span>Total</span>
              <span className="text-pink-600">{formatPrice(total)}</span>
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>

          <p className="text-center text-xs text-charcoal-600">
            By placing this order you agree to our terms of service.
          </p>
        </div>
      </form>
    </div>
  );
}