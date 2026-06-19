'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema } from '@/lib/validations';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Something went wrong.');
      return;
    }
    const signInRes = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (signInRes?.error) {
      router.push('/login');
      return;
    }
    router.push('/account');
    router.refresh();
  };

  return (
    <div className="w-full card p-8">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 font-display text-lg font-bold text-white">
          PP
        </span>
        <h1 className="font-display text-2xl font-bold text-charcoal">Create Account</h1>
        <p className="mt-1 text-sm text-charcoal-600">
          Join Pink Pistachio for faster checkout &amp; order tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-field">Full Name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              {...register('name')}
              className="input-field pl-11"
              placeholder="Your name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="label-field">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              {...register('email')}
              type="email"
              className="input-field pl-11"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label-field">Phone</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              {...register('phone')}
              className="input-field pl-11"
              placeholder="03XX XXXXXXX"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="label-field">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-600/50" />
            <input
              {...register('password')}
              type="password"
              className="input-field pl-11"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
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