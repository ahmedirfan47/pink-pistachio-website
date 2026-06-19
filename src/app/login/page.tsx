import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="container-px mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center py-12">
      <Suspense fallback={
        <div className="w-full card p-8 text-center text-charcoal-600">Loading...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}