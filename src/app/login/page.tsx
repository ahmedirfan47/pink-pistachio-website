'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema } from '@/lib/validations';
import { Loader2, Lock, Mail } from 'lucide-react';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    const res = await signIn('credentials', { ...data, redirect: false });
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    const callbackUrl = searchParams.get('callbackUrl') || '/account';
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="container-px mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center py-12">
      <div className="w-full card p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 font-display text-lg font-bold text-white">PP</span>
          <h1 className="font-display text-2xl font-bold text-charcoal">Welcome Back</h1>
          <p className="mt-1 text-sm text-charcoal-600">Login to track orders and earn rewards.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-field">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
              <input {...register('email')} type="email" className="input-field pl-11" placeholder="you@example.com" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label-field">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
              <input {...register('password')} type="password" className="input-field pl-11" placeholder="••••••••" />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-charcoal-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-pink-600 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}