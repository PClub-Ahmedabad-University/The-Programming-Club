import connectDB from '../lib/db';
import wmcgameaudienceModel from '../models/wmcgameaudience.model';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const audiences = await wmcgameaudienceModel.find({}).lean();
  return NextResponse.json(audiences);
}

export async function PATCH(req) {
  await connectDB();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

  const updated = await wmcgameaudienceModel.findByIdAndUpdate(
    id,
    { retrys: -1 },
    { new: true }
  );

  return NextResponse.json(updated);
}
