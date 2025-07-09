import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/app/api/models/user.model';

async function POST(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        if (!userId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        
        // Find user with projection to only get necessary fields
        const user = await User.findById(userId).select('codeforcesHandle codeforcesRank').lean();
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (!user.codeforcesHandle) {
            return NextResponse.json({ 
                message: 'No Codeforces handle found. Please verify your handle first.',
                code: 'NO_HANDLE'
            }, { status: 400 });
        }
        
        // Fetch user info from Codeforces
        const response = await fetch(
            `https://codeforces.com/api/user.info?handles=${encodeURIComponent(user.codeforcesHandle)}`,
            { next: { revalidate: 60 } } // Cache for 60 seconds
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch Codeforces user info');
        }
        
        const userInfo = await response.json();
        
        if (userInfo.status !== 'OK' || !userInfo.result || userInfo.result.length === 0) {
            throw new Error('Invalid response from Codeforces API');
        }
        
        const rank = userInfo.result[0].rank || 'unrated';
        const rating = userInfo.result[0].rating || 0;
        
        // Update user with new rank
        const updateData = { codeforcesRank: rank };
        
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            updateData,
            { 
                new: true,
                upsert: false,
                runValidators: true
            }
        ).select('codeforcesRank codeforcesHandle').lean();
        
        if (!updatedUser) {
            throw new Error('Failed to update user rank');
        }
        
        return NextResponse.json({
            message: 'Rank refreshed successfully',
            rank: updatedUser.codeforcesRank,
            handle: updatedUser.codeforcesHandle
        }, { status: 200 });
        
    } catch (error) {
        console.error('Refresh rank error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: error.status || 500 }
        );
    }
}

export { POST };