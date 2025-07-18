import Like from "@/app/api/models/likes.model";
import { NextResponse } from "next/server";
import connectDB from "@/app/api/lib/db";

export const GET = async (req, { params }) => {
    try {
        await connectDB();
        const likes = await Like.find({ blogId: params.blogId });
        
        return NextResponse.json(likes, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store'
            }
        });
    } catch (err) {
        console.error('Error in GET /api/like/[blogId]:', err);
        return NextResponse.json(
            { 
                success: false, 
                error: err.message || 'Failed to fetch likes' 
            }, 
            { 
                status: 400,
                headers: {
                    'Cache-Control': 'no-store, max-age=0'
                }
            }
        );
    }
};
