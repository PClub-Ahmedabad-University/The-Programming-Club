import cron from "node-cron";
import connectDB from "../lib/db.js";
import { saveWeeklySnapshot } from "./updateWeeklyLeaderboard.js";

(async () => {
  await connectDB();

  // Schedule cron: every 5 seconds
  cron.schedule("0 0 * * 1", async () => {
    try {
      console.log("⏰ Running weekly leaderboard snapshot...");
      const snap = await saveWeeklySnapshot();
      console.log("✅ Snapshot saved:", snap._id);
    } catch (err) {
      console.error("❌ Error saving snapshot:", err);
    }
  });

  console.log("🚀 Cron job initialized: running every 5 seconds for testing...");
})();
