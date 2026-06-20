'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/session-context';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Tag,
  Image as ImageIcon, Settings, MessageSquare, LogOut, ExternalLink, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin/dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',        icon: Package         },
  { href: '/admin/categories', label: 'Categories',      icon: FolderTree      },
  { href: '/admin/orders',     label: 'Orders',          icon: ShoppingCart    },
  { href: '/admin/customers',  label: 'Customers',       icon: Users           },
  { href: '/admin/coupons',    label: 'Coupons',         icon: Tag             },
  { href: '/admin/banners',    label: 'Banners & Gallery', icon: ImageIcon     },
  { href: '/admin/messages',   label: 'Inquiries',       icon: MessageSquare   },
  { href: '/admin/settings',   label: 'Settings',        icon: Settings        },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex h-full flex-col bg-charcoal text-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 font-display text-base font-bold text-white">
            PP
          </span>
          <div>
            <p className="font-display text-sm font-bold leading-tight">
              Pink Pistachio
            </p>
            <p className="text-[10px] uppercase tracking-wider text-cream/50">
              Admin Panel
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-cream/60 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {links.map((link) => {
          const Icon   = link.icon;
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-pink-600 text-white'
                  : 'text-cream/70 hover:bg-white/5 hover:text-cream'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/70 hover:bg-white/5 hover:text-cream"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          View Website
        </a>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-white/5"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );
}