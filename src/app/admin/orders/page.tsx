import AdminShell from '@/components/admin/AdminShell';
import OrdersClient from './OrdersClient';
export const dynamic = 'force-dynamic';
export default function OrdersPage() {
  return <AdminShell title="Orders"><OrdersClient /></AdminShell>;
}
