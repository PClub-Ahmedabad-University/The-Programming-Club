// src/app/api/resources/get/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import fileModel from '../../models/file.model';
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');

    const query = parentId ? { parentId } : { parentId: null };

    const files = await fileModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
