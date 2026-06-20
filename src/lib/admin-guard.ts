import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin/dashboard');
  }
  return session;
}

export async function requireAdminApi() {
  const session = await getServerSession();
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}