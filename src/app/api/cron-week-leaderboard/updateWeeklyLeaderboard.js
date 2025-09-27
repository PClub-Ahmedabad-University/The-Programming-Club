import connectDB from "../lib/db.js";
import { getLeaderboardLast7Days } from "../controllers/weeklyLeaderboard.js";
import weeklyLeaderboardSnapshot from "../models/weeklyLeaderboardSnapshot.js";

export const saveWeeklySnapshot = async () => {
  await connectDB();

  const leaderboard = await getLeaderboardLast7Days();

  const now = new Date();

  // Calculate Monday of this week
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday (0) => -6
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // Convert Monday to IST
  const mondayIST = new Date(monday.getTime() + 5.5 * 60 * 60 * 1000); 
  console.log("Monday IST:", mondayIST);

  // Calculate Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Convert Sunday to IST
  const sundayIST = new Date(sunday.getTime() + 5.5 * 60 * 60 * 1000);
  console.log("Sunday IST:", sundayIST);

  const snap = await weeklyLeaderboardSnapshot.findOneAndUpdate(
    { weekStart: mondayIST },
    {
      leaderboard,
      weekStart: mondayIST,
      weekEnd: sundayIST,
      createdAt: new Date() // current time in UTC
    },
    { upsert: true, new: true }
  );

  return snap;
};
