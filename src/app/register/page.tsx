import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container-px mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center py-12">
      <Suspense fallback={
        <div className="w-full card p-8 text-center text-charcoal-600">Loading...</div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}