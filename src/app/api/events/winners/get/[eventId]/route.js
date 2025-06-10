import { getWinners } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";

export const GET = async (_req, { params }) => {
  try {
    const { eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }
    
    const result = await getWinners(eventId);
    
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch winners",
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
