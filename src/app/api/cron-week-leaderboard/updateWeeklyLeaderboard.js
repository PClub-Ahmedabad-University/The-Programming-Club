import connectDB from "../lib/db.js";
import { getLeaderboardLast7Days } from "../controllers/weeklyLeaderboard.js";
import weeklyLeaderboardSnapshot from "../models/weeklyLeaderboardSnapshot.js";

export const saveWeeklySnapshot = async () => {
  await connectDB();

  const leaderboard = await getLeaderboardLast7Days();

  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);


  const snap = await weeklyLeaderboardSnapshot.findOneAndUpdate(
    { weekStart: monday },
    {
      leaderboard,
      weekStart: monday,
      weekEnd: sunday,
      createdAt: new Date()
    },
    { upsert: true, new: true }
  );

  return snap;
};
