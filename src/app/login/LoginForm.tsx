'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useSession } from '@/lib/session-context';

export default function LoginForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Session cookie is now set — refresh context then redirect
      refresh();

      const raw = searchParams.get('callbackUrl');
      const callbackUrl =
        raw && raw.startsWith('/') ? raw : '/account';

      router.push(callbackUrl);
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
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-charcoal-600">
          Login to track orders and manage your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="input-field pl-11"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="input-field pl-11"
              placeholder="••••••••"
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
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 rounded-2xl bg-pink-50 px-4 py-3 text-center text-xs text-charcoal-600">
        Admin:{' '}
        <span className="font-semibold text-charcoal">admin@pinkpistachio.pk</span>
      </div>

      <p className="mt-6 text-center text-sm text-charcoal-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-pink-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}