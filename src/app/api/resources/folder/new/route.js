import { NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/db';
import fileModel from '@/app/api/models/file.model';
export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { name, parentId } = body;

  if (!name) {
    return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
  }

  const folder = await fileModel.create({
    name,
    type: 'folder',
    parentId: parentId || null,
  });

  return NextResponse.json({ success: true, folder });
}
