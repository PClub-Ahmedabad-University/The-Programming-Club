import { loginUser } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  console.log('Login request received');
  try {
    const data = await req.json();
    console.log('Login attempt for email:', data.email);
    
    try {
      const { token, user } = await loginUser(data);
      console.log('Login successful for user:', data.email);
      return NextResponse.json({ token, user }, { status: 200 });
    } catch (e) {
      console.error('Login error:', e);
      return NextResponse.json(
        { 
          error: e.message || 'Login failed',
          type: 'login_error',
          details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        }, 
        { status: 400 }
      );
    }
  } catch (e) {
    console.error('Request parsing error:', e);
    return NextResponse.json(
      { 
        error: 'Invalid request format',
        type: 'request_error',
        details: process.env.NODE_ENV === 'development' ? e.message : undefined
      },
      { status: 400 }
    );
  }
};
