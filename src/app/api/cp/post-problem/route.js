// src/app/api/cp/post-problem/route.js
import { NextResponse } from "next/server";
import handler from "../../controllers/cp.controller";

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