import { Suspense } from 'react';
import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a Pink Pistachio account for faster checkout and order tracking.',
};

export default function RegisterPage() {
  return (
    <div className="container-px mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center py-12">
      <Suspense
        fallback={
          <div className="w-full rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
            </div>
            <p className="text-sm text-charcoal-600">Loading...</p>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}