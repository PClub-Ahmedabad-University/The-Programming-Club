import CPProblem from "../models/cp-problem.model.js";
import ProblemSolve from "../models/problemSolve.model.js";
import connectDB from "../lib/db.js";

const normalizeId = (id) => id.replace(/-/g, '');

const getLeaderboard = async () => {
  try {
    await connectDB();

    // Normalize problem IDs from CPProblem
    const activeProblems = await CPProblem.find({ isActive: true }).lean();

    const problemMap = new Map(
      activeProblems.map((p) => [normalizeId(p.problemId), p.postedAt])
    );

    const activeProblemIds = Array.from(problemMap.keys());
    if (activeProblemIds.length === 0) return [];

    // Fetch submissions with problemId normalization in aggregation
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
      {
        $sort: { solvedAt: 1 }
      },
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
      {
        $sort: { solvedCount: -1 }
      }
    ]);

    const leaderboard = [];

    for (const user of userSubmissions) {
      try {
        const userId = user._id.toString();
        let totalTimeMs = 0;
        let validSubmissions = 0;

        for (const sub of user.submissions) {
          const problemId = normalizeId(sub.problemId);
          const solvedAt = new Date(sub.solvedAt);
          const postedAt = new Date(problemMap.get(problemId));

          if (!postedAt || isNaN(solvedAt.getTime()) || isNaN(postedAt.getTime())) continue;

          totalTimeMs += solvedAt - postedAt;
          validSubmissions++;
        }

        if (validSubmissions > 0) {
          leaderboard.push({
            userId,
            codeforcesHandle: user.codeforcesHandle || `user_${userId.slice(0, 6)}`,
            solvedCount: validSubmissions,
            totalTimeMs
          });
        }
      } catch (error) {
        console.error(`Error processing user ${user._id}:`, error);
      }
    }

    leaderboard.sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) {
        return b.solvedCount - a.solvedCount;
      }
      return a.totalTimeMs - b.totalTimeMs;
    });
    console.log("Leaderboard:", leaderboard);

    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    throw new Error("Failed to generate leaderboard: " + error.message);
  }
};

const getRank = async (codeforcesHandle) => {
    try {
        const leaderboard = await getLeaderboard();
        const user = leaderboard.find(user => user.codeforcesHandle === codeforcesHandle);
        return user ? user.rank : null;
    } catch (error) {
        console.error("Error in getRank:", error);
        throw new Error("Failed to get rank: " + error.message);
    }
};

export { getLeaderboard, getRank };
