import { deleteWinner } from "@/app/api/controllers/event.controller.js";
import { NextResponse } from "next/server";

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get('eventId');
    const winnerId = url.searchParams.get('winnerId');

    if (!eventId || !winnerId) {
      return NextResponse.json(
        { error: 'Missing required parameters: eventId and winnerId are required' }, 
        { status: 400 }
      );
    }

    const result = await deleteWinner({ eventId, winnerId });
    
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete winner',
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
