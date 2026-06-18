import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    await db.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 });
    }
    console.error('[newsletter] error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}