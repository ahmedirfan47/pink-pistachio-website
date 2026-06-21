import AdminShell from '@/components/admin/AdminShell';
import BannersClient from './BannersClient';
export const dynamic = 'force-dynamic';
export default function BannersPage() {
  return <AdminShell title="Banners & Gallery"><BannersClient /></AdminShell>;
}
