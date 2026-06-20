import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { getServerSession } from '@/lib/get-session';
import { db } from '@/lib/db';
import { formatDate, formatPrice, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session) redirect('/login?callbackUrl=/account/orders');

  const orders = await db.order.findMany({
    where:   { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="container-px mx-auto max-w-4xl py-12">
      <h1 className="section-heading mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 py-16 text-center text-charcoal-600">
          <Package className="mx-auto mb-3 h-10 w-10 text-pink-300" />
          You haven&apos;t placed any orders yet.
          <Link href="/menu" className="mt-4 block font-semibold text-pink-600">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.orderNumber}`}
              className="card block p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-bold text-charcoal">
                    {o.orderNumber}
                  </p>
                  <p className="text-xs text-charcoal-600">
                    {formatDate(o.createdAt)} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}
                  >
                    {STATUS_LABELS[o.status]}
                  </span>
                  <p className="font-display text-base font-bold text-pink-600">
                    {formatPrice(o.total)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}