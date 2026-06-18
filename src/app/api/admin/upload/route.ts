import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdminApi } from '@/lib/admin-guard';

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Image storage is not configured. Add BLOB_READ_WRITE_TOKEN.' }, { status: 500 });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const blob = await put(filename, file, { access: 'public' });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    console.error('[admin/upload] error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}