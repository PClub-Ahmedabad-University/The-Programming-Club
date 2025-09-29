import connectDB from "../lib/db.js";
import { getLeaderboardLast7Days } from "../controllers/weeklyLeaderboard.js";
import weeklyLeaderboardSnapshot from "../models/weeklyLeaderboardSnapshot.js";

export const saveWeeklySnapshot = async () => {
  await connectDB();

  const leaderboard = await getLeaderboardLast7Days();

  // ---- Helper to work with IST ----
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5h30m in ms
  const nowUTC = new Date();

  // Current IST date/time
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);

  // Get IST day of week (0 = Sunday, 1 = Monday, ...)
  const istDay = nowIST.getDay();

  // We need *last* week's Monday 00:00 IST
  // Step 1: find this week's Monday 00:00 IST
  const diffToMonday = istDay === 0 ? -6 : 1 - istDay;
  const thisMondayIST = new Date(nowIST);
  thisMondayIST.setDate(nowIST.getDate() + diffToMonday);
  thisMondayIST.setHours(0, 0, 0, 0);

  // Step 2: go back one full week for last Monday
  const lastMondayIST = new Date(thisMondayIST);
  lastMondayIST.setDate(thisMondayIST.getDate() - 7);

  // Last Sunday 23:59:59.999 IST = lastMonday + 6 days
  const lastSundayIST = new Date(lastMondayIST);
  lastSundayIST.setDate(lastMondayIST.getDate() + 6);
  lastSundayIST.setHours(23, 59, 59, 999);

  console.log("Last Monday (IST):", lastMondayIST);
  console.log("Last Sunday (IST):", lastSundayIST);

  // ---- Convert IST times back to UTC for DB storage ----
  const weekStartUTC = new Date(lastMondayIST.getTime() - IST_OFFSET);
  const weekEndUTC   = new Date(lastSundayIST.getTime() - IST_OFFSET);

  const snap = await weeklyLeaderboardSnapshot.create({
    leaderboard,
    weekStart: weekStartUTC,   // Stored in UTC
    weekEnd: weekEndUTC,       // Stored in UTC
    createdAt: new Date()      // Current time in UTC
  });

  return snap;
};
