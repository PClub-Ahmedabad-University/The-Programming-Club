import { NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/db';
import ResourceMetric from '@/app/api/models/resourceMetric.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const metrics = await ResourceMetric.find({}).lean();
    
    // Convert array to a map keyed by resourceId
    const metricsMap = {};
    metrics.forEach(metric => {
      metricsMap[metric.resourceId] = {
        stars: metric.stars,
        upvotes: metric.upvotes
      };
    });

    return NextResponse.json({ success: true, data: metricsMap });
  } catch (error) {
    console.error('Error fetching resource metrics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resource metrics' },
      { status: 500 }
    );
  }
}
