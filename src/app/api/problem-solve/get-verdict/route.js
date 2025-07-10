import { NextResponse } from "next/server";
import ProblemSolve from "@/app/api/models/problemSolve.model.js";
import connectDB from "@/app/api/lib/db";

export const GET = async (request) => {
    try {
        await connectDB();
        
        // Get query parameters from the request URL
        const { searchParams } = new URL(request.url);
        const problemId = searchParams.get('problemId');
        const codeforcesHandle = searchParams.get('codeforcesHandle');

        if (!problemId || !codeforcesHandle) {
            return NextResponse.json(
                { error: "Missing required query parameters: problemId and codeforcesHandle are required" },
                { status: 400 }
            );
        }

        // Find the earliest accepted submission for this problem and user
        const submission = await ProblemSolve.findOne({
            problemId,
            codeforcesHandle,
            verdict: "OK"
        }).sort({ solvedAt: 1 }).lean(); // Get the earliest submission

        if (!submission) {
            return NextResponse.json(
                { error: "No accepted submission found" },
                { status: 404 }
            );
        }

        // Return the submission data
        return NextResponse.json({
            problemId: submission.problemId,
            codeforcesHandle: submission.codeforcesHandle,
            verdict: submission.verdict,
            solvedAt: submission.solvedAt,
            submissionId: submission.submissionId
        }, { status: 200 });

    } catch (error) {
        console.error('Error in get-verdict:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
};
