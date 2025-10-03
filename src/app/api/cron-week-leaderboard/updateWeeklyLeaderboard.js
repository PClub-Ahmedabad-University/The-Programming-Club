import connectDB from "../lib/db.js";
import { getLeaderboardLast7Days } from "../controllers/weeklyLeaderboard.js";
import weeklyLeaderboardSnapshot from "../models/weeklyLeaderboardSnapshot.js";

export const saveWeeklySnapshot = async () => {
  await connectDB();

  const leaderboard = await getLeaderboardLast7Days();

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const nowUTC = new Date();


  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);

  const istDay = nowIST.getDay();

  const diffToMonday = istDay === 0 ? -6 : 1 - istDay;
  const thisMondayIST = new Date(nowIST);
  thisMondayIST.setDate(nowIST.getDate() + diffToMonday);
  thisMondayIST.setHours(0, 0, 0, 0);

  const lastMondayIST = new Date(thisMondayIST);
  lastMondayIST.setDate(thisMondayIST.getDate() - 7);

  const lastSundayIST = new Date(lastMondayIST);
  lastSundayIST.setDate(lastMondayIST.getDate() + 6);
  lastSundayIST.setHours(23, 59, 59, 999);

  const weekStartUTC = new Date(lastMondayIST.getTime() - IST_OFFSET);
  const weekEndUTC   = new Date(lastSundayIST.getTime() - IST_OFFSET);

  const snap = await weeklyLeaderboardSnapshot.create({
    leaderboard,
    weekStart: weekStartUTC,  
    weekEnd: weekEndUTC,
    createdAt: new Date()   
  });
  return snap;
};
