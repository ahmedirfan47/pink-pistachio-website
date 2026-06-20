'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema } from '@/lib/validations';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (!res) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      if (res.error) {
        setError('Invalid email or password. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (res.ok) {
        // Use the callbackUrl from searchParams, but validate it's a relative path
        const rawCallback = searchParams.get('callbackUrl');
        const callbackUrl =
          rawCallback && rawCallback.startsWith('/')
            ? rawCallback
            : '/account';

        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const busy = isSubmitting || loading;

  return (
    <div className="w-full card p-8">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pink-600 font-display text-xl font-bold text-white shadow-float">
          PP
        </span>
        <h1 className="font-display text-2xl font-bold text-charcoal">Welcome Back</h1>
        <p className="mt-1 text-sm text-charcoal-600">
          Login to track orders and manage your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-field">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="input-field pl-11"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label-field">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="input-field pl-11"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 rounded-2xl bg-pink-50 px-4 py-3 text-center text-xs text-charcoal-600">
        Admin? Login with <span className="font-semibold text-charcoal">admin@pinkpistachio.pk</span>
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
