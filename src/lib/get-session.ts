import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME, type SessionPayload } from '@/lib/auth-token';

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}