// app/api/compare/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import wmcgameaudienceModel from '../../models/wmcgameaudience.model';
export async function POST(req) {
  try {
    const body = await req.json();
    const { audiencenumber, ownernumber } = body;
    const areEqual = audiencenumber === ownernumber;
    const currentAudience = await wmcgameaudienceModel.findOne({enrollmentNumber:audiencenumber})
    if (!currentAudience) {
    return res.status(404).json({ error: 'Audience not found' });
    } 
    if(!areEqual) {
    currentAudience.retrys = Math.max(currentAudience.retrys - 1, 0);
    } else {
        currentAudience.retrys = 9999;
    }
    await currentAudience.save();
    return NextResponse.json({ areEqual }, {status:200});
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
