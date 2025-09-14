import { NextResponse } from 'next/server';
import weeklyLeaderboardSnapshot from '../../models/weeklyLeaderboardSnapshot';
import connectDB from '../../lib/db';

export async function GET() {
  try {
    await connectDB();
    const leaderboard = await weeklyLeaderboardSnapshot.findOne()  ;
    console.log(leaderboard)
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error in leaderboard route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
