import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSchema } from '@/lib/validations';
import { sendContactReceivedEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const message = await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ?? null,
        subject: data.subject ?? null,
        message: data.message,
      },
    });

    // Admin notification
    db.notification.create({
      data: {
        type: 'MESSAGE',
        title: 'New Message from ' + data.name,
        body: data.subject ?? data.message.slice(0, 60),
        link: '/admin/messages',
      },
    }).catch(() => {});

    sendContactReceivedEmail(message.email, message.name).catch(() => {});

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}