import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/admin-guard';
import { z } from 'zod';

const schema = z.object({ status: z.enum(['new', 'read', 'resolved']) });

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { status } = schema.parse(body);
    const message = await db.contactMessage.update({ where: { id: params.id }, data: { status } });
    return NextResponse.json(message);
  } catch (err) {
    console.error('[admin/messages PUT] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.contactMessage.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/messages DELETE] error:', err);
    return NextResponse.json({ error: 'Could not delete message' }, { status: 400 });
  }
}
