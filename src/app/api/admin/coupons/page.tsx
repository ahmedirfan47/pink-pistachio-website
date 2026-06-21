import AdminShell from '@/components/admin/AdminShell';
import CouponsClient from './CouponsClient';
export const dynamic = 'force-dynamic';
export default function CouponsPage() {
  return <AdminShell title="Coupons"><CouponsClient /></AdminShell>;
}