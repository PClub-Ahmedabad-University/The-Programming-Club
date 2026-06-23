import { NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/db';
import ResourceMetric from '@/app/api/models/resourceMetric.model';

export async function POST(request) {
  try {
    const { resourceId, type, action = 'add' } = await request.json();

    if (!resourceId || !['star', 'upvote'].includes(type) || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Determine the increment value: +1 for add, -1 for remove
    const incValue = action === 'add' ? 1 : -1;
    const updateField = type === 'star' ? { stars: incValue } : { upvotes: incValue };
    
    const updatedMetric = await ResourceMetric.findOneAndUpdate(
      { resourceId },
      { $inc: updateField },
      { new: true, upsert: true }
    );

    // Prevent negative numbers (if removed below 0)
    if (updatedMetric.stars < 0 || updatedMetric.upvotes < 0) {
      if (updatedMetric.stars < 0) updatedMetric.stars = 0;
      if (updatedMetric.upvotes < 0) updatedMetric.upvotes = 0;
      await updatedMetric.save();
    }

    return NextResponse.json({ success: true, data: updatedMetric });
  } catch (error) {
    console.error('Error updating resource metric:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update resource metric' },
      { status: 500 }
    );
  }
}
