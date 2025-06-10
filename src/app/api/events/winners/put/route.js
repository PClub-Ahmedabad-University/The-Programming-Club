import { updateWinner } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid JSON payload" 
        },
        { status: 400 }
      );
    }

    const { eventId, winnerId, updateData } = body;

    if (!eventId || !winnerId || !updateData) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields: eventId, winnerId, and updateData are required" 
        },
        { status: 400 }
      );
    }
    
    const result = await updateWinner({ 
      eventId, 
      winnerId, 
      updateData 
    });
    
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
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
