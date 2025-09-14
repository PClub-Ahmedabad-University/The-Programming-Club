import mongoose from "mongoose";

const LastWeekLeaderboardSnapSchema = new mongoose.Schema({
    weekStart: { type: Date, required: true },  // Monday 00:00
    weekEnd: { type: Date, required: true },  // Sunday 23:59:59
    createdAt: { type: Date, default: Date.now },
    leaderboard: { type: Array, required: true }
});

export default mongoose.models.LastWeekLeaderboardSnap ||
    mongoose.model("LastWeekLeaderboardSnap", LastWeekLeaderboardSnapSchema);
