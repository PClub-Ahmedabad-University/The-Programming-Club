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
        const { searchParams } = new URL(request.url);
        let page = parseInt(searchParams.get("page") || "1");
        let limit = parseInt(searchParams.get("limit") || "15");
        const sortBy = searchParams.get("sortBy") || "solvedAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 15;
        if (limit > 100) limit = 100;

        const sort = {};
        const order = sortOrder === "asc" ? 1 : -1;
        if (sortBy === "handle") {
            sort.codeforcesHandle = order;
        } else if (sortBy === "problem") {
            sort.problemId = order;
        } else {
            sort.solvedAt = order;
        }
        sort._id = -1;

        const offset = (page - 1) * limit;
        const totalItems = await ProblemSolve.countDocuments({});
        const totalPages = Math.ceil(totalItems / limit);

        const problems = await ProblemSolve.find({})
            .sort(sort)
            .skip(offset)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: problems,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
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