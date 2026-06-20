import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth-token';
import { z } from 'zod';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createToken({
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    });

    const isProd = process.env.NODE_ENV === 'production';

    const response = NextResponse.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   isProd,
      sameSite: 'lax',
      maxAge:   COOKIE_MAX_AGE,
      path:     '/',
    });

    return response;
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('[login] error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}