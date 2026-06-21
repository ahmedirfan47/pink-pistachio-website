import AdminShell from '@/components/admin/AdminShell';
import SettingsClient from './SettingsClient';
export const dynamic = 'force-dynamic';
export default function SettingsPage() {
  return <AdminShell title="Settings"><SettingsClient /></AdminShell>;
}
