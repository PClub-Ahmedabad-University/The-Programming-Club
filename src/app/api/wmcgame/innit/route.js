import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import wmcgameuserModel from '../../models/wmcgameuser.model';
export async function POST(req) {
  try {
    await connectDB();

    const { enrollmentNumber, treasure, role } = await req.json();

    if (!enrollmentNumber || !treasure || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await wmcgameuserModel.findOne({ enrollmentNumber });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this enrollment number already exists' }, { status: 409 });
    }

    const user = await wmcgameuserModel.create({ enrollmentNumber, treasure, role });

    return NextResponse.json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}