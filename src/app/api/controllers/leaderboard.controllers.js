import CPProblem from "../models/cp-problem.model.js";
import ProblemSolve from "../models/problemSolve.model.js";
import connectDB from "../lib/db.js";

const normalizeId = (id) => id.replace(/-/g, ''); // ← ✅ fix here

const getLeaderboard = async () => {
  try {
    await connectDB();

    const activeProblems = await CPProblem.find({ isActive: true }).lean();

    const problemMap = new Map(
      activeProblems.map(p => [normalizeId(p.problemId), p.postedAt])
    );

    const activeProblemIds = Array.from(problemMap.keys()); // now normalized
    if (activeProblemIds.length === 0) return [];

    const userSubmissions = await ProblemSolve.aggregate([
      {
        $match: {
          verdict: 'OK',
          problemId: { $in: activeProblemIds } // match normalized IDs
        }
      },
      {
        $sort: { solvedAt: 1 }
      },
      {
        $group: {
          _id: { userId: '$userId', problemId: '$problemId' },
          userId: { $first: '$userId' },
          problemId: { $first: '$problemId' },
          firstSolvedAt: { $first: '$solvedAt' },
          codeforcesHandle: { $first: '$codeforcesHandle' }
        }
      },
      {
        $group: {
          _id: '$userId',
          codeforcesHandle: { $first: '$codeforcesHandle' },
          submissions: {
            $push: {
              problemId: '$problemId',
              solvedAt: '$firstSolvedAt'
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

    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    throw new Error('Failed to generate leaderboard: ' + error.message);
  }
};

export { getLeaderboard };
