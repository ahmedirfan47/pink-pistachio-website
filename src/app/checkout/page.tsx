import { Suspense } from 'react';
import CheckoutInner from './CheckoutInner';

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container-px mx-auto max-w-6xl py-12 text-center text-charcoal-600">
          Loading checkout...
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}