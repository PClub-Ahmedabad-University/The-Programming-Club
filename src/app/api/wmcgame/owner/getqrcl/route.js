import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import wmcgameuserModel from '../../../models/wmcgameuser.model';
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
        console.log(existingUser);
      return NextResponse.json({
        message: "User already exists",
        user: existingUser
      }, { status: 200 });
    }


    // Create QR code payload
    // const qrPayload = {
    //   enrollmentNumber,
    //   treasure,
    //   role
    // };

    // Generate QR code as Data URL
    // const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

    // Create the user with QR code
    // const user = await wmcgameuserModel.create({
    //   enrollmentNumber,
    //   treasure,
    //   role,
    //   qrCode: qrCodeDataUrl // Make sure your schema has this field
    // });

    return NextResponse.json({
      message: 'User does not exist'
    },{status:404}
    );

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
