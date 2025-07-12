import { NextResponse } from "next/server";
import { getRank } from "@/app/api/controllers/leaderboard.controllers";

export async function GET(request, { params }) {
    try {
        // First try to get from route params (new format)
        let codeforcesHandle = params?.codeforcesHandle;
        
        // If not found in params, try query params (old format)
        if (!codeforcesHandle) {
            codeforcesHandle = request.nextUrl.searchParams.get("codeforcesHandle");
        }

        if (!codeforcesHandle) {
            return NextResponse.json(
                { success: false, error: "Codeforces handle is required" },
                { status: 400 }
            );
        }

        const rank = await getRank(codeforcesHandle);
        return NextResponse.json({ success: true, data: rank });
    } catch (error) {
        console.error("Error in getRank route:", error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || "Failed to get rank",
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: error.status || 500 }
        );
    }
}
