import connectDB from "@/app/api/lib/db";
import User from "@/app/api/models/user.model";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';


export async function GET(request) {
  try {
    await connectDB();
    
    // Check if authorization header exists
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json(
          { success: false, message: 'Session expired. Please log in again.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Fetch user data
    const user = await User.findById(decodedToken.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found' },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        codeforcesHandle: user.codeforcesHandle || null,
        codeforcesRank: user.codeforcesRank || "unrated",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/users/me:", error);
    
    // Handle database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { success: false, message: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    
    // Handle other unexpected errors
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred while fetching your profile.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
  
