import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import wmcgameaudienceModel from '../../models/wmcgameaudience.model';
import wmcgameuserModel from '../../models/wmcgameuser.model';
import QRCode from 'qrcode';

export async function POST(req) {
  try {
    await connectDB();
    const { enrollmentNumber } = await req.json();

    if (!enrollmentNumber) {
      return NextResponse.json({ error: 'enrollmentNumber is required' }, { status: 400 });
    }

    let existingAudience = await wmcgameaudienceModel.findOne({ enrollmentNumber });

    if (existingAudience) {
      if (!existingAudience.qrCode) {
        const pairedOwner = await wmcgameuserModel.findById(existingAudience.pairedWith);
        if (!pairedOwner) {
          return NextResponse.json({ error: 'Paired owner not found' }, { status: 404 });
        }

        const qrPayload = {
          audienceEnrollment: enrollmentNumber,
          treasure: pairedOwner.treasure
        };

        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
        existingAudience.qrCode = qrCodeDataUrl;
        await existingAudience.save();
      }
      const pairedwithdata = await wmcgameuserModel.findById(existingAudience.pairedWith);
      return NextResponse.json({
        message: `Audience already paired with ${pairedwithdata.enrollmentNumber}`,
        audience: existingAudience,
        qrCode: existingAudience.qrCode
      });
    }

    // --- Create new audience ---
    existingAudience = new wmcgameaudienceModel({
      enrollmentNumber,
      role: 'audience'
    });

    const owners = await wmcgameuserModel.find({ role: 'owner' });
    if (owners.length === 0) {
      return NextResponse.json({ error: 'No owners available to pair' }, { status: 404 });
    }

    const randomOwner = owners[Math.floor(Math.random() * owners.length)];
    if (!randomOwner.assignedAudience.includes(enrollmentNumber)) {
      randomOwner.assignedAudience.push(enrollmentNumber);
      await randomOwner.save();
    }
    existingAudience.pairedWith = randomOwner._id;

    const qrPayload = {
      audienceEnrollment: enrollmentNumber,
      treasure: randomOwner.treasure
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
    existingAudience.qrCode = qrCodeDataUrl;
    existingAudience.retrys = 3;
    await existingAudience.save();

    return NextResponse.json({
      message: `Audiene paired with owner ${randomOwner.enrollmentNumber}`,
      audience: existingAudience,
      qrCode: qrCodeDataUrl
    });

  } catch (error) {
    console.error('Error pairing audience:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
