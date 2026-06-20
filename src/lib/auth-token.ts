import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-me';

export interface SessionPayload {
  id:    string;
  name:  string;
  email: string;
  role:  'ADMIN' | 'CUSTOMER';
  exp:   number;
}

export const COOKIE_NAME = 'pp-auth';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export function createToken(user: Omit<SessionPayload, 'exp'>): string {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + COOKIE_MAX_AGE * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;

    const encoded = token.slice(0, dot);
    const sig     = token.slice(dot + 1);

    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(encoded)
      .digest('base64url');

    // Constant-time comparison prevents timing attacks
    const sigBuf      = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as SessionPayload;

    if (Date.now() > payload.exp) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge = COOKIE_MAX_AGE) {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    `${COOKIE_NAME}=`,          // value filled in by caller
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=Lax`,
    isProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}