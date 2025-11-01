import { NextResponse } from "next/server";
import ProblemSolve from "@/app/api/models/problemSolve.model.js";
import connectDB from "@/app/api/lib/db";

export async function GET(request, { params }) {
    const { problemId } = await params;
    try {
        await connectDB();
        
        // problemId is already destructured from params
        
        if (!problemId) {
            return NextResponse.json(
                { error: 'Problem ID is required' },
                { status: 400 }
            );
        }

        // Find all accepted submissions for this problem
        const submissions = await ProblemSolve.find({
            // Match either the exact problemId or the version with/without hyphen
            $or: [
                { problemId },
                { problemId: problemId.replace('-', '') },
                { problemId: `${problemId.substring(0, problemId.length-1)}-${problemId.slice(-1)}` }
            ],
            verdict: "OK"
        }).sort({ solvedAt: -1 }); // Sort by most recent first

        // Transform submissions to include necessary details
        const solverDetails = submissions.map(sub => ({
            codeforcesHandle: sub.codeforcesHandle,
            solvedAt: sub.solvedAt,
            submissionId: sub.submissionId,
            problemId: sub.problemId
        }));

        return NextResponse.json({ 
            success: true,
            submissions: solverDetails || [] 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error in get-solved-by:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch submissions',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
};