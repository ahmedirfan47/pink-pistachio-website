import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Pink Pistachio account to track orders and manage your profile.',
};

export default function LoginPage() {
  return (
    <div className="container-px mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center py-12">
      <Suspense
        fallback={
          <div className="w-full rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
            </div>
            <p className="text-sm text-charcoal-600">Loading login form...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}