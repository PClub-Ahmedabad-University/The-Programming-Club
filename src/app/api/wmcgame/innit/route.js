import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import wmcgameuserModel from '../../models/wmcgameuser.model';
import QRCode from 'qrcode';

export async function POST(req) {
  try {
    await connectDB();

    const { enrollmentNumber, treasure, role } = await req.json();

    if (!enrollmentNumber || !treasure || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await wmcgameuserModel.findOne({ enrollmentNumber });
    if (existingUser) {
      return NextResponse.json(existingUser, {status:200});
    }

    // Create QR code payload
    const qrPayload = {
      enrollmentNumber,
      treasure,
      role
    };

    // Generate QR code as Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

    // Create the user with QR code
    const user = await wmcgameuserModel.create({
      enrollmentNumber,
      treasure,
      role,
      qrCode: qrCodeDataUrl // Make sure your schema has this field
    });

    return NextResponse.json({
      message: 'User created successfully with QR code',
      user
    });

  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
