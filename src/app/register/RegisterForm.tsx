'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { useSession } from '@/lib/session-context';

export default function RegisterForm() {
  const router      = useRouter();
  const { refresh } = useSession();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: create account
      const regRes = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error ?? 'Could not create account');
        setLoading(false);
        return;
      }

      // Step 2: auto-login
      const loginRes = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      if (!loginRes.ok) {
        router.push('/login');
        return;
      }

      refresh();
      router.push('/account');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full card p-8">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pink-600 font-display text-xl font-bold text-white">
          PP
        </span>
        <h1 className="font-display text-2xl font-bold text-charcoal">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-charcoal-600">
          Join Pink Pistachio for faster checkout &amp; order tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Full Name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              value={form.name}
              onChange={set('name')}
              className="input-field pl-11"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div>
          <label className="label-field">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className="input-field pl-11"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <label className="label-field">Phone</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              value={form.phone}
              onChange={set('phone')}
              className="input-field pl-11"
              placeholder="03XX XXXXXXX"
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <div>
          <label className="label-field">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              className="input-field pl-11"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-pink-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}