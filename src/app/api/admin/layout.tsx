import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/get-session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  return <>{children}</>;
}