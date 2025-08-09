import connectDB from "@/app/api/lib/db.js";
import LeaderboardSnapshot from "@/app/api/models/leaderboardSnapshot.js";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  try {
    const snapshot = await LeaderboardSnapshot.findOne({ type: "monthly" })
      .sort({ periodEnd: -1 })
      .lean();
    return NextResponse.json(snapshot ? snapshot.leaderboard : [], { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/leaderboard/monthly:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
