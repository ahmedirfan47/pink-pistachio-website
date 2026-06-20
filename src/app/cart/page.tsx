import type { Metadata } from 'next';
import CartInner from './CartInner';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your Pink Pistachio order before checkout.',
};

export default function CartPage() {
  return <CartInner />;
}