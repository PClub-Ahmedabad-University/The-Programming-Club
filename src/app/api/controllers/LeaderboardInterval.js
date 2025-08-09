import CPProblem from "../models/cp-problem.model.js";
import ProblemSolve from "../models/problemSolve.model.js";
import connectDB from "../lib/db.js";

const normalizeId = (id) => id.replace(/-/g, '');

const getLeaderboard = async (periodType = "all") => {
  try {
    await connectDB();

    // Determine time range based on periodType
    const now = new Date();
    let periodStart = null;
    let periodEnd = now;

    if (periodType === "weekly") {
      periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - 7);
      periodStart.setHours(0, 0, 0, 0);
    } else if (periodType === "monthly") {
      periodStart = new Date();
      periodStart.setMonth(periodStart.getMonth() - 1);
      periodStart.setHours(0, 0, 0, 0);
    }

    // Get active problems
    const activeProblemsQuery = { isActive: true };
    if (periodStart) {
      activeProblemsQuery.postedAt = { $gte: periodStart, $lte: periodEnd };
    }

    const activeProblems = await CPProblem.find(activeProblemsQuery).lean();
    const problemMap = new Map(
      activeProblems.map((p) => [normalizeId(p.problemId), p.postedAt])
    );

    const activeProblemIds = Array.from(problemMap.keys());
    if (activeProblemIds.length === 0) return [];

    // Get submissions that solved the problems
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
          normalizedProblemId: { $in: activeProblemIds }
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
      const userId = user._id.toString();
      let totalTimeMs = 0;
      let validSubmissions = 0;

      for (const sub of user.submissions) {
        const problemId = normalizeId(sub.problemId);
        const solvedAt = new Date(sub.solvedAt);
        const postedAt = new Date(problemMap.get(problemId));

        if (!postedAt || isNaN(solvedAt) || isNaN(postedAt)) continue;

        // 8 AM next-day cutoff
        const cutoff = new Date(postedAt);
        cutoff.setDate(cutoff.getDate() + 1);
        cutoff.setHours(8, 0, 0, 0);

        if (solvedAt <= cutoff) {
          totalTimeMs += solvedAt - postedAt;
          validSubmissions++;
        }
      }

      if (validSubmissions > 0) {
        leaderboard.push({
          userId,
          codeforcesHandle: user.codeforcesHandle || `user_${userId.slice(0, 6)}`,
          solvedCount: validSubmissions,
          totalTimeMs
        });
      }
    }

    leaderboard.sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) {
        return b.solvedCount - a.solvedCount;
      }
      return a.totalTimeMs - b.totalTimeMs;
    });

    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    throw new Error("Failed to generate leaderboard: " + error.message);
  }
};

export { getLeaderboard };
