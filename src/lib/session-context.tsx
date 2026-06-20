'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  role:  'ADMIN' | 'CUSTOMER';
}

interface SessionContextValue {
  session: { user: SessionUser } | null;
  status:  'loading' | 'authenticated' | 'unauthenticated';
  refresh: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  status:  'loading',
  refresh: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] =
    useState<{ user: SessionUser } | null>(null);
  const [status, setStatus] =
    useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const user: SessionUser = await res.json();
        setSession({ user });
        setStatus('authenticated');
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch {
      setSession(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ session, status, refresh: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export async function signOut(options?: { callbackUrl?: string }) {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = options?.callbackUrl ?? '/';
}