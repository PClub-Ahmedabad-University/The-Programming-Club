import connectDB from "@/app/api/lib/db";
import User from "@/app/api/models/user.model";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    await connectDB();

    const { codeforcesHandle } = await request.json();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Update the user's Codeforces handle
    const user = await User.findByIdAndUpdate(
      userId,
      { codeforcesHandle },
      { new: true, select: '-password' }
    );

    return NextResponse.json({
      message: 'Codeforces handle updated successfully',
      codeforcesHandle: user.codeforcesHandle
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This Codeforces handle is already in use" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "An error occurred while updating your profile" },
      { status: 500 }
    );
  }
}
