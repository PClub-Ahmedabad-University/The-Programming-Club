import CPProblem from "../models/cp-problem.model.js";
import ProblemSolve from "../models/problemSolve.model.js";
import connectDB from "../lib/db.js";
import weeklyLeaderboardSnapshot from "../models/weeklyLeaderboardSnapshot.js";

const normalizeId = (id) => id.replace(/-/g, "");

export const getLeaderboardLast7Days = async () => {
  await connectDB();

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  // Active problems
  const activeProblems = await CPProblem.find({ isActive: true }).lean();
  const problemMap = new Map(
    activeProblems.map((p) => [normalizeId(p.problemId), p.postedAt])
  );
  const activeProblemIds = Array.from(problemMap.keys());
  if (activeProblemIds.length === 0) return [];

  // Fetch submissions only in last 7 days
  const userSubmissions = await ProblemSolve.aggregate([
    {
      $addFields: {
        normalizedProblemId: {
          $replaceAll: { input: "$problemId", find: "-", replacement: "" }
        }
      }
    },
    {
      $match: {
        verdict: "OK",
        normalizedProblemId: { $in: activeProblemIds },
        solvedAt: { $gte: sevenDaysAgo }
      }
    },
    { $sort: { solvedAt: 1 } },
    {
      $group: {
        _id: { userId: "$userId", problemId: "$normalizedProblemId" },
        userId: { $first: "$userId" },
        problemId: { $first: "$normalizedProblemId" },
        firstSolvedAt: { $first: "$solvedAt" },
        codeforcesHandle: { $first: "$codeforcesHandle" }
      }
    },
    {
      $group: {
        _id: "$userId",
        codeforcesHandle: { $first: "$codeforcesHandle" },
        submissions: {
          $push: {
            problemId: "$problemId",
            solvedAt: "$firstSolvedAt"
          }
        },
        solvedCount: { $sum: 1 }
      }
    },
    { $sort: { solvedCount: -1 } }
  ]);

  const leaderboard = [];

  for (const user of userSubmissions) {
    let totalTimeMs = 0;
    let validSubmissions = 0;

    for (const sub of user.submissions) {
      const solvedAt = new Date(sub.solvedAt);
      const postedAt = new Date(problemMap.get(sub.problemId));
      if (!postedAt || isNaN(solvedAt.getTime()) || isNaN(postedAt.getTime()))
        continue;
      totalTimeMs += solvedAt - postedAt;
      validSubmissions++;
    }

    if (validSubmissions > 0) {
      leaderboard.push({
        userId: user._id.toString(),
        codeforcesHandle:
          user.codeforcesHandle || `user_${user._id.toString().slice(0, 6)}`,
        solvedCount: validSubmissions,
        totalTimeMs
      });
    }
  }

  leaderboard.sort((a, b) => {
    if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
    return a.totalTimeMs - b.totalTimeMs;
  });

  return leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 }));
};
// export const getSnapshot=async()=>{
//     connectDB();
//     const leaderboard=weeklyLeaderboardSnapshot.findOne();

// }