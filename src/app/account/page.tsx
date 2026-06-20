import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, ClipboardList, ArrowRight } from 'lucide-react';
import { getServerSession } from '@/lib/get-session';
import { db } from '@/lib/db';
import { formatDate, formatPrice, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect('/login?callbackUrl=/account');

  const [user, recentOrders] = await Promise.all([
    db.user.findUnique({ where: { id: session.id } }),
    db.order.findMany({
      where:   { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take:    3,
    }),
  ]);

  return (
    <div className="container-px mx-auto max-w-5xl py-12">
      <h1 className="section-heading mb-8">My Account</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 font-display text-2xl font-bold text-pink-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-charcoal">
              {user?.name}
            </h2>
            <div className="mt-4 w-full space-y-2 text-left text-sm text-charcoal-600">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-pink-500" /> {user?.email}
              </p>
              {user?.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-pink-500" /> {user.phone}
                </p>
              )}
            </div>
          </div>
          {session.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="btn-primary mt-6 w-full">
              Go to Admin Dashboard
            </Link>
          )}
        </div>

        {/* Recent orders */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <ClipboardList className="h-5 w-5 text-pink-500" /> Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:underline"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-pink-200 py-10 text-center text-sm text-charcoal-600">
              You haven&apos;t placed any orders yet.
              <Link href="/menu" className="mt-3 block font-semibold text-pink-600">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.orderNumber}`}
                  className="flex items-center justify-between rounded-xl border border-pink-100 p-4 transition-colors hover:bg-pink-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      {o.orderNumber}
                    </p>
                    <p className="text-xs text-charcoal-600">
                      {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-pink-600">
                      {formatPrice(o.total)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[o.status]}`}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}