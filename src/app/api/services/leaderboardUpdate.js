import cron from "node-cron";
import { getLeaderboard } from "../controllers/LeaderboardInterval.js";
import LeaderboardSnapshot from "../models/leaderboardSnapshot.js";

cron.schedule("* * * * *", async () => {
  console.log("[CRON] Updating weekly leaderboard snapshot...");
  try {
    const leaderboard = await getLeaderboard({ period: "weekly" });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    await LeaderboardSnapshot.create({
      type: "weekly",
      periodStart: weekStart,
      periodEnd: now,
      leaderboard
    });

    console.log("[CRON] Weekly leaderboard updated successfully!");
  } catch (err) {
    console.error("[CRON] Error updating weekly leaderboard:", err);
  }
});

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (tomorrow.getDate() !== 1) return;

  console.log("[CRON] Updating monthly leaderboard snapshot...");
  try {
    const leaderboard = await getLeaderboard({ period: "monthly" });

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    await LeaderboardSnapshot.create({
      type: "monthly",
      periodStart: monthStart,
      periodEnd: now,
      leaderboard
    });

    console.log("[CRON] Monthly leaderboard updated successfully!");
  } catch (err) {
    console.error("[CRON] Error updating monthly leaderboard:", err);
  }
});
