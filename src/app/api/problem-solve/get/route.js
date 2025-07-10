import { NextResponse } from "next/server";
import ProblemSolve from "@/app/api/models/problemSolve.model.js";
import connectDB from "@/app/api/lib/db";

/**
 * GET /api/problem-solve/all
 * Fetches all problem solve entries, sorted by solvedAt (latest first).
 */
export const GET = async (request) => {
    try {
        await connectDB();

        const problems = await ProblemSolve.find({})
            .sort({ solvedAt: -1 }); // Descending order

        return NextResponse.json({
            success: true,
            data: problems,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching problems:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to retrieve problem solves.",
            error: error.message
        }, { status: 500 });
    }
};
