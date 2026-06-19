import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, MapPin, Phone, Mail, Package } from 'lucide-react';
import {
  formatPrice,
  formatDate,
  STATUS_LABELS,
  STATUS_COLORS,
  ORDER_STATUSES,
} from '@/lib/utils';

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export const revalidate = 0;

export default async function OrderTrackingPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const currentIndex = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="container-px mx-auto max-w-4xl py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pistachio-100 text-pistachio-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-charcoal sm:text-3xl">
          Thank you, {order.customerName.split(' ')[0]}!
        </h1>
        <p className="mt-2 text-charcoal-600">Your order has been placed successfully.</p>
        <p className="mt-1 font-mono text-sm font-bold text-pink-600">{order.orderNumber}</p>
      </div>

      {order.status !== 'CANCELLED' ? (
        <div className="card mb-8 p-6">
          <h2 className="font-display text-lg font-bold text-charcoal">Order Status</h2>
          <div className="mt-6 flex items-start justify-between">
            {ORDER_STATUSES.slice(0, 5).map((status, idx) => (
              <div key={status} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div
                    className={
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-10 sm:w-10 ' +
                      (idx <= currentIndex
                        ? 'bg-pink-600 text-white'
                        : 'bg-pink-100 text-pink-300')
                    }
                  >
                    {idx + 1}
                  </div>
                  {idx < 4 && (
                    <div
                      className={
                        'h-0.5 flex-1 ' +
                        (idx < currentIndex ? 'bg-pink-600' : 'bg-pink-100')
                      }
                    />
                  )}
                </div>
                <p
                  className={
                    'mt-2 text-[10px] font-medium sm:text-xs ' +
                    (idx <= currentIndex ? 'text-charcoal' : 'text-charcoal-600/40')
                  }
                >
                  {STATUS_LABELS[status]}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card mb-8 p-6 text-center">
          <span className={'inline-block rounded-full border px-4 py-1.5 text-sm font-semibold ' + STATUS_COLORS.CANCELLED}>
            Order Cancelled
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <Package className="h-5 w-5 text-pink-500" /> Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-pink-50">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal-600">
                    Qty {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="text-sm font-bold text-charcoal">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-pink-100 pt-4 text-sm">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-pistachio-600">
                <span>Discount{order.couponCode ? ' (' + order.couponCode + ')' : ''}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-600">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-pink-100 pt-2 text-base font-bold text-charcoal">
              <span>Total</span>
              <span className="text-pink-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-charcoal">Order Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal-600">Date</dt>
                <dd className="font-medium text-charcoal">{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-600">Status</dt>
                <dd>
                  <span className={'rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + STATUS_COLORS[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-600">Payment</dt>
                <dd className="font-medium text-charcoal">
                  {order.paymentMethod.replace('_', ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-600">Fulfilment</dt>
                <dd className="font-medium capitalize text-charcoal">{order.deliveryType}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-charcoal">
              {order.deliveryType === 'pickup' ? 'Pickup From' : 'Delivery Address'}
            </h2>
            <div className="mt-3 space-y-2 text-sm text-charcoal-600">
              {order.deliveryType === 'pickup' ? (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                  {order.branch}
                </p>
              ) : (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                  {[order.address, order.area, order.city].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-pink-500" />
                {order.customerPhone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-pink-500" />
                {order.customerEmail}
              </p>
            </div>
          </div>

          <Link href="/menu" className="btn-secondary w-full">
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
}