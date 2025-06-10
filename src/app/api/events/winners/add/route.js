import { addWinners } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { eventTitle, eventWinners } = body;

    if (!eventTitle || !eventWinners) {
      return NextResponse.json(
        { error: "Missing required fields: eventTitle and eventWinners are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(eventWinners)) {
      return NextResponse.json(
        { error: "eventWinners must be an array" },
        { status: 400 }
      );
    }
    
    const result = await addWinners({ eventTitle, eventWinners });
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error.stack,
          originalError: error.originalError?.message 
        })
      },
      { 
        status: error.statusCode || 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
};
