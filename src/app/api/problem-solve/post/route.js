import { NextResponse } from "next/server";
import ProblemSolve from "@/app/api/models/problemSolve.model.js";
import connectDB from "@/app/api/lib/db";

export const POST = async (req) => {
    try {
        await connectDB();

        const body = await req.json();
        const { problemId, codeforcesHandle, userId, postedAt } = body;

        if (!problemId || !userId || !codeforcesHandle || !postedAt) {
            return NextResponse.json({
                error: 'Missing required fields: problemId, userId, codeforcesHandle, or postedAt'
            }, { status: 400 });
        }
        const match = problemId.match(/^(\d+)([A-Z][0-9]*)$/i);
        if (!match) {
            return NextResponse.json({
                error: 'Invalid problemId format. Expected format: contestId + index (e.g., "2119B")'
            }, { status: 400 });
        }

        const contestId = match[1];
        const problemIndex = match[2];

        const postedTime = new Date(postedAt).getTime();
        if (isNaN(postedTime)) {
            return NextResponse.json({
                error: 'Invalid postedAt timestamp'
            }, { status: 400 });
        }

        const response = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${codeforcesHandle}`);
        const data = await response.json();

        if (data.status !== 'OK') {
            return NextResponse.json({
                error: 'Failed to fetch submissions from Codeforces'
            }, { status: 500 });
        }

        const filteredSubmissions = data.result.filter(sub =>
            sub.problem.index === problemIndex &&
            sub.creationTimeSeconds * 1000 > postedTime
        );

        if (!filteredSubmissions.length) {
            return NextResponse.json({
                error: 'No submissions found for the problem after postedAt'
            }, { status: 404 });
        }

        // Process submissions one by one to handle duplicates
        let savedCount = 0;
        const savedSubmissions = [];

        for (const sub of filteredSubmissions) {
            const submissionDoc = {
                userId,
                codeforcesHandle,
                problemId,
                solvedAt: new Date(sub.creationTimeSeconds * 1000),
                submissionId: sub.id.toString(),
                verdict: sub.verdict,
            };

            try {
                // Use findOneAndUpdate with upsert to prevent duplicates
                const result = await ProblemSolve.findOneAndUpdate(
                    { submissionId: submissionDoc.submissionId },
                    { $setOnInsert: submissionDoc },
                    { 
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true,
                        runValidators: true
                    }
                );
                
                if (result) {
                    savedCount++;
                    savedSubmissions.push(result);
                }
            } catch (error) {
                // Ignore duplicate key errors (code 11000)
                if (error.code !== 11000) {
                    console.error('Error saving submission:', error);
                    // Continue with other submissions even if one fails
                }
            }
        }

        return NextResponse.json({
            success: true,
            count: savedCount,
            totalSubmissions: filteredSubmissions.length,
            message: savedCount > 0 
                ? `Successfully saved ${savedCount} new submission(s)`
                : 'No new submissions to save',
            savedSubmissions
        }, { status: 201 });

    } catch (error) {
        console.error('Error in problem-solve POST:', error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return NextResponse.json({
                error: 'Duplicate submission detected',
                details: 'This submission has already been recorded',
                code: 'DUPLICATE_SUBMISSION'
            }, { status: 409 });
        }
        
        return NextResponse.json({
            error: 'Failed to save problem submissions',
            details: error.message,
            code: error.code || 'INTERNAL_SERVER_ERROR'
        }, { status: 500 });
    }
};
