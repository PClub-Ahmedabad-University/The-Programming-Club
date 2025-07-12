import { NextResponse } from "next/server";
import ProblemSolve from "@/app/api/models/problemSolve.model.js";
import connectDB from "@/app/api/lib/db";


export const GET = async (request, { params }) => {
  try {
    await connectDB();
    const { codeforcesHandle } = params;

    const problems = await ProblemSolve.aggregate([
      {
        $match: {
          codeforcesHandle,
          verdict: "OK"
        }
      },
      {
        $addFields: {
          normalizedProblemId: {
            $replaceAll: { input: "$problemId", find: "-", replacement: "" }
          }
        }
      },
      {
        $sort: { solvedAt: 1 } 
      },
      {
        $group: {
          _id: "$normalizedProblemId",
          problemId: { $first: "$problemId" },
          solvedAt: { $first: "$solvedAt" },
          codeforcesHandle: { $first: "$codeforcesHandle" },
          submissionId: { $first: "$submissionId" },
          userId: { $first: "$userId" },
        }
      },
      {
        $sort: { solvedAt: 1 } 
      }
    ]);

    return NextResponse.json({ success: true, data: problems }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
