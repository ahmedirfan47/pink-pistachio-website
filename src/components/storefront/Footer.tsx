import Link from 'next/link';
import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BRANCHES, NAV_LINKS, SITE } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-pink-100 bg-white">
      <div className="container-px mx-auto max-w-7xl py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-600 font-display text-lg font-bold text-white">
                PP
              </span>
              <span className="font-display text-xl font-bold text-charcoal">Pink Pistachio</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal-600">
              A boutique cafe and patisserie bringing European-style bakes, specialty coffee
              and all-day brunch to Lahore — pretty, considered, and made to be shared.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.instagram.com/pistachio.pink"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition-colors hover:bg-pink-100">
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition-colors hover:bg-pink-100">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-charcoal">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-charcoal-600">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-pink-600">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/account/orders" className="transition-colors hover:text-pink-600">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-pink-600">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Branch info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-charcoal">
              Visit Us
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {BRANCHES.map((b) => (
                <div key={b.id} className="text-sm text-charcoal-600">
                  <p className="font-semibold text-charcoal">{b.name}</p>
                  <p className="mt-1 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                    {b.address}
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-pink-500" />
                    {b.hours}
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-pink-500" />
                    {b.phone}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-charcoal-600">
              <Mail className="h-4 w-4 shrink-0 text-pink-500" />
              hello@pinkpistachio.pk
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-pink-100 pt-6 text-xs text-charcoal-600 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {SITE.legalName}. All rights reserved.</p>
          <p>Designed with love in Lahore, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}