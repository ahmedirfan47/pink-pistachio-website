import AdminShell from '@/components/admin/AdminShell';
import CategoriesClient from './CategoriesClient';
export const dynamic = 'force-dynamic';
export default function CategoriesPage() {
  return <AdminShell title="Categories"><CategoriesClient /></AdminShell>;
}
