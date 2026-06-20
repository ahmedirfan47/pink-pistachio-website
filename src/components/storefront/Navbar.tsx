'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, User, LogOut, ClipboardList } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useSession, signOut } from '@/lib/session-context';

export default function Navbar() {
  const [open,         setOpen]         = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { session } = useSession();
  const count = useCartStore((s) => s.getCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-cream/90 shadow-sm backdrop-blur-md'
          : 'bg-cream/60 backdrop-blur-sm'
      )}
    >
      <div className="container-px mx-auto flex h-20 max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-600 font-display text-lg font-bold text-white shadow-sm">
            PP
          </span>
          <span className="font-display text-xl font-bold tracking-wide text-charcoal sm:text-2xl">
            Pink Pistachio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium uppercase tracking-wide transition-colors hover:text-pink-600',
                pathname === link.href ? 'text-pink-600' : 'text-charcoal'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/menu" className="hidden btn-primary sm:inline-flex">
            Order Now
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-full p-2 transition-colors hover:bg-pink-100"
            aria-label="Cart"
          >
            <ShoppingBag className="h-6 w-6 text-charcoal" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          {/* User menu — desktop */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="rounded-full p-2 transition-colors hover:bg-pink-100"
              aria-label="Account"
            >
              <User className="h-6 w-6 text-charcoal" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl border border-pink-100 bg-white p-2 shadow-lg">
                {session ? (
                  <>
                    <p className="px-3 py-2 text-sm text-charcoal-600">
                      Hi, {session.user.name.split(' ')[0]}
                    </p>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-pink-50"
                    >
                      <User className="h-4 w-4" /> My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-pink-50"
                    >
                      <ClipboardList className="h-4 w-4" /> My Orders
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-pink-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-1 p-1">
                    <Link
                      href="/login"
                      className="rounded-xl px-3 py-2 text-sm hover:bg-pink-50"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700 hover:bg-pink-100"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 transition-colors hover:bg-pink-100 lg:hidden"
            aria-label="Menu"
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-pink-100 bg-cream px-4 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-xl px-3 py-3 text-sm font-medium uppercase tracking-wide',
                  pathname === link.href
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-charcoal'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-pink-100 pt-3">
              {session ? (
                <>
                  <Link href="/account" className="rounded-xl px-3 py-3 text-sm">
                    My Account
                  </Link>
                  <Link href="/account/orders" className="rounded-xl px-3 py-3 text-sm">
                    My Orders
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="rounded-xl px-3 py-3 text-sm font-medium text-pink-600"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl px-3 py-3 text-left text-sm text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl px-3 py-3 text-sm">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-pink-50 px-3 py-3 text-sm font-medium text-pink-700"
                  >
                    Create Account
                  </Link>
                </>
              )}
              <Link href="/menu" className="btn-primary mt-2 w-full">
                Order Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}