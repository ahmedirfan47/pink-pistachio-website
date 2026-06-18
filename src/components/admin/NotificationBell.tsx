'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell, ShoppingCart, AlertTriangle, MessageSquare,
  Package, X, CheckCheck, Loader2,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: 'ORDER' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'MESSAGE';
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  ORDER:       { icon: ShoppingCart, color: 'text-pink-600',      bg: 'bg-pink-100' },
  LOW_STOCK:   { icon: AlertTriangle, color: 'text-amber-600',    bg: 'bg-amber-100' },
  OUT_OF_STOCK:{ icon: Package,       color: 'text-red-600',      bg: 'bg-red-100' },
  MESSAGE:     { icon: MessageSquare, color: 'text-pistachio-600', bg: 'bg-pistachio-100' },
};

const POLL_INTERVAL = 30_000; // 30 seconds

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationResponse>({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const result: NotificationResponse = await res.json();

      // Browser notification if new orders arrived and tab not focused
      if (
        result.unreadCount > prevCount.current &&
        prevCount.current > 0 &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        new Notification('Pink Pistachio — New Notification', {
          body: `You have ${result.unreadCount} unread alerts`,
          icon: '/favicon.ico',
        });
      }
      prevCount.current = result.unreadCount;
      setData(result);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Request browser notification permission
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'POST' });
      setData((prev) => ({
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } finally {
      setMarking(false);
    }
  };

  const markOneRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });
    setData((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      notifications: prev.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    }));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-2xl p-2.5 text-charcoal-600 transition-colors hover:bg-pink-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {data.unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white animate-pulse">
            {data.unreadCount > 9 ? '9+' : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 animate-slideDown rounded-3xl border border-pink-100 bg-white shadow-hover sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3">
            <h3 className="font-display text-base font-bold text-charcoal">Notifications</h3>
            <div className="flex items-center gap-2">
              {data.unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={marking}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-pink-600 hover:bg-pink-50"
                >
                  {marking ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-pink-50">
                <X className="h-4 w-4 text-charcoal-600" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto admin-scroll">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
              </div>
            ) : data.notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Bell className="h-8 w-8 text-pink-200" />
                <p className="mt-2 text-sm font-medium text-charcoal-600">All caught up!</p>
                <p className="text-xs text-charcoal-600/60">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-50">
                {data.notifications.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.ORDER;
                  const Icon = cfg.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => { if (!n.isRead) markOneRead(n.id); setOpen(false); }}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-pink-50/50',
                        !n.isRead && 'bg-pink-50/30'
                      )}
                    >
                      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                        <Icon className={cn('h-4 w-4', cfg.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm leading-snug text-charcoal', !n.isRead && 'font-semibold')}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-charcoal-600/70 line-clamp-1">{n.body}</p>
                        <p className="mt-1 text-[10px] text-charcoal-600/50">{formatDate(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-pink-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-pink-100 px-4 py-2.5 text-center">
            <Link
              href="/admin/orders"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-pink-600 hover:underline"
            >
              View all orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}