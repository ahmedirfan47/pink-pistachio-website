import AdminShell from '@/components/admin/AdminShell';
import ProductsClient from './ProductsClient';
export const dynamic = 'force-dynamic';
export default function ProductsPage() {
  return <AdminShell title="Products"><ProductsClient /></AdminShell>;
}
