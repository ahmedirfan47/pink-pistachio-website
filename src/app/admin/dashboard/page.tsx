import AdminShell from '@/components/admin/AdminShell';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <DashboardClient />
    </AdminShell>
  );
}