import { NextResponse } from "next/server";
import connectDB from "../lib/db.js";
import { saveWeeklySnapshot } from "./updateWeeklyLeaderboard.js";

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
    await connectDB();
    const snap = await saveWeeklySnapshot();
    return NextResponse.json({
      success: true,
      message: "Weekly snapshot saved successfully",
      snapshot: snap
    });
  } catch (err) {
    console.error("Error saving weekly snapshot:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save snapshot" },
      { status: 500 }
    );
  }
}
