import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/app/api/models/user.model';
import redis from '@/lib/redis'; // ✅ Your Redis instance

// Expiry time for verification (in seconds)
const VERIFICATION_TTL = 3 * 60; // 3 minutes

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
      
      // Save in Redis with expiry
      await redis.set(
        `verification:${userId}`,
        JSON.stringify(verificationData),
        'EX',
        VERIFICATION_TTL
      );

      return NextResponse.json({
        message: 'Verification started',
        expiresAt: Date.now() + VERIFICATION_TTL * 1000
      });
    } 
    else if (action === 'verify' && handle) {
      // Retrieve from Redis
      const verificationStr = await redis.get(`verification:${userId}`);
      if (!verificationStr) {
        return NextResponse.json(
          { message: 'No active verification found. Please start a new one.' },
          { status: 400 }
        );
      }

      const verificationData = JSON.parse(verificationStr);

      // Check if verification expired (extra safeguard, since Redis already has TTL)
      if (Date.now() - verificationData.timestamp > VERIFICATION_TTL * 1000) {
        await redis.del(`verification:${userId}`);
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

      // Fetch user info
      const userInfo = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
      const userInfoJson = await userInfo.json();
      const rank = userInfoJson.result[0].rank;
      const rating = userInfoJson.result[0].rating;

      // Update user's handle and rank in database
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          codeforcesHandle: verificationData.handle,
          codeforcesRank: rank || 'unrated',
          codeforcesRating: rating || 0
        },
        { 
          new: true,
          upsert: false,
          setDefaultsOnInsert: true
        }
      ).lean();
      
      if (!user) {
        throw new Error('Failed to update user profile');
      }

      // Clean up Redis
      await redis.del(`verification:${userId}`);

      return NextResponse.json({
        message: 'Handle verified successfully!',
        handle: verificationData.handle,
        rank,
        rating
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
