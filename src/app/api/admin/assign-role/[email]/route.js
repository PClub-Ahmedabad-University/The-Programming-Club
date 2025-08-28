import { NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/db';
import User from '@/app/api/models/user.model.js';
import { verifyJWT } from '@/app/api/lib/jwt';

export async function PATCH(request, { params }) {
  try {
    // Connect to the database
    await connectDB();

    // Verify authentication token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = await verifyJWT(token);
      console.log('Decoded token:', decoded); // Debug log
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    const requestingUser = await User.findOne({ _id: decoded.id });
    console.log('Requesting user:', requestingUser); // Debug log
    
    if (!requestingUser) {
      return NextResponse.json(
        { error: 'Requesting user not found' },
        { status: 404 }
      );
    }
    
    if (requestingUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can assign roles' },
        { status: 403 }
      );
    }

    // Extract the email from the URL parameters and decode it
    const { email } = params;
    const decodedEmail = decodeURIComponent(email);
    console.log('Target email:', decodedEmail); // Debug log
    
    // Get the request body
    let newRole;
    try {
      const body = await request.json();
      newRole = body.newRole;
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate the role
    const validRoles = ['admin', 'user', 'moderator', 'cp-cym-moderator', 'clubMember'];
    console.log('Requested new role:', newRole);
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Find the user by email (using the decoded email)
    const user = await User.findOne({ email: decodedEmail });
    if (!user) {
      console.log(`User not found with email: ${decodedEmail}`); // Debug log
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`Found user: ${user.name} with role: ${user.role}`); // Debug log

    // Update the user's role
    user.role = newRole;
    await user.save();

    // Return the updated user with a clear structure
    return NextResponse.json({
      message: 'User role updated successfully',
      user: user
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}