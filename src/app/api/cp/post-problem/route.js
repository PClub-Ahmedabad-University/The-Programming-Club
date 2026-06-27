// src/app/api/cp/post-problem/route.js
import { NextResponse } from "next/server";
import handler from "../../controllers/cp.controller";
import CPProblem from "../../models/cp-problem.model";

export async function POST(request) {
  try {
    const result = await handler(request);
    return NextResponse.json(result, { status: result.message.includes('already exists') ? 200 : 201 });
  } catch (error) {
    console.error('Error in POST route:', error);

    if (error.message === 'Problem link is required') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Invalid Codeforces problem link') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Problem not found on Codeforces') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Problem already exists in database' }, { status: 409 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");

    // Backward compatibility: return all problems if no page is provided
    if (!pageParam) {
      const problems = await CPProblem.find({})
        .sort({ postedAt: -1 });

      return NextResponse.json({
        success: true,
        problems,
      });
    }

    const parsedPage = Number.parseInt(pageParam, 10);
    const parsedLimit = Number.parseInt(
      searchParams.get("limit") || "10",
      10
    );

    const currentPage = Number.isNaN(parsedPage)
      ? 1
      : Math.max(parsedPage, 1);

    const pageSize = Number.isNaN(parsedLimit)
      ? 10
      : Math.min(Math.max(parsedLimit, 1), 50);

    const skip = (currentPage - 1) * pageSize;

    const totalProblems = await CPProblem.countDocuments();

    const totalPages =
      totalProblems === 0
        ? 0
        : Math.ceil(totalProblems / pageSize);

    const problems = await CPProblem.find({})
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return NextResponse.json({
      success: true,
      problems,
      pagination: {
        totalProblems,
        totalPages,
        currentPage,
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error("Error in GET route:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}