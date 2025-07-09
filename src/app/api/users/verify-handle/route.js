import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/app/api/models/user.model';

// In-memory store for verification data (use Redis in production)
const verificationStore = new Map();

// Clean up expired verifications every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationStore.entries()) {
    if (now - value.timestamp > 3 * 60 * 1000) { // 3 minutes
      verificationStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request) {
  try {
    const { handle, action, submissionId } = await request.json();
    const authHeader = request.headers.get('authorization');
    
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

    if (action === 'start') {
      // Start verification process
      const verificationData = {
        handle,
        userId,
        timestamp: Date.now()
      };
      
      verificationStore.set(userId, verificationData);

      return NextResponse.json({
        message: 'Verification started',
        expiresAt: Date.now() + 3 * 60 * 1000 // 3 minutes from now
      });
    } 
    else if (action === 'verify' && handle) {
      // Verify submission
      const verificationData = verificationStore.get(userId);
      
      if (!verificationData) {
        return NextResponse.json(
          { message: 'No active verification found. Please start a new one.' },
          { status: 400 }
        );
      }

      // Check if verification expired
      if (Date.now() - verificationData.timestamp > 3 * 60 * 1000) {
        verificationStore.delete(userId);
        return NextResponse.json(
          { message: 'Verification expired. Please try again.' },
          { status: 400 }
        );
      }

      // Fetch user's submissions from Codeforces
      const response = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10`
      );
      
      if (!response.ok) {
        return NextResponse.json(
          { message: 'Failed to fetch submissions from Codeforces. Please try again later.' },
          { status: 500 }
        );
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        return NextResponse.json(
          { message: data.comment || 'Failed to verify submission. Please try again.' },
          { status: 400 }
        );
      }

      // Get the most recent submission
      const submission = data.result[0];
      if (!submission) {
        return NextResponse.json(
          { message: 'No submissions found. Please submit your code first.' },
          { status: 400 }
        );
      }

      // Verify submission requirements
      const submissionTime = submission.creationTimeSeconds * 1000; // Convert to ms
      const isWithinTimeframe = submissionTime >= verificationData.timestamp;
      const isCompilationError = submission.verdict === 'COMPILATION_ERROR';
      const isCorrectProblem = 
        submission.problem.contestId === 1408 && 
        submission.problem.index === 'A';

      if (!isWithinTimeframe) {
        return NextResponse.json(
          { message: 'No recent submission found. Please submit your code and try again.' },
          { status: 400 }
        );
      }

      if (!isCorrectProblem) {
        return NextResponse.json(
          { message: 'Please submit to problem 1408A (Circle Coloring).' },
          { status: 400 }
        );
      }

      if (!isCompilationError) {
        return NextResponse.json(
          { message: 'Your submission must result in a compilation error. Please add a syntax error and resubmit.' },
          { status: 400 }
        );
      }

      // Update user's handle in database
      const user = await User.findByIdAndUpdate(
        userId,
        { codeforcesHandle: verificationData.handle },
        { new: true }
      );

      // Clean up
      verificationStore.delete(userId);

      return NextResponse.json({
        message: 'Handle verified successfully!',
        handle: verificationData.handle
      });
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
