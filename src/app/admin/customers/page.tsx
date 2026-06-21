import AdminShell from '@/components/admin/AdminShell';
import CustomersClient from './CustomersClient';
export const dynamic = 'force-dynamic';
export default function CustomersPage() {
  return <AdminShell title="Customers"><CustomersClient /></AdminShell>;
}
