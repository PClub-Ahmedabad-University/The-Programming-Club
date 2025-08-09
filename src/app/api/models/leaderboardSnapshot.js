import mongoose from "mongoose";

const leaderboardSnapshotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["weekly", "monthly"],
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  leaderboard: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.models.LeaderboardSnapshot ||
  mongoose.model("LeaderboardSnapshot", leaderboardSnapshotSchema);
