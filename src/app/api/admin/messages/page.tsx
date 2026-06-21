import AdminShell from '@/components/admin/AdminShell';
import MessagesClient from './MessagesClient';
export const dynamic = 'force-dynamic';
export default function MessagesPage() {
  return <AdminShell title="Messages"><MessagesClient /></AdminShell>;
}