import { NextResponse } from 'next/server';
import { getLeaderboard } from '../controllers/leaderboard.controllers.js';

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error in leaderboard route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
