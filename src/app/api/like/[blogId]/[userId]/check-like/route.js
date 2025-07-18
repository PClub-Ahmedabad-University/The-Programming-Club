import { NextResponse } from "next/server";
import Like from "@/app/api/models/likes.model";
import connectDB from "@/app/api/lib/db";

// Helper function to set cache control headers
const getResponseHeaders = () => ({
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'CDN-Cache-Control': 'no-cache',
  'Vercel-CDN-Cache-Control': 'no-cache'
});

export const GET = async (req, { params }) => {
    const { blogId, userId } = params;
    
    // Validate parameters
    if (!blogId || !userId) {
        return NextResponse.json(
            { success: false, error: 'Missing blogId or userId' },
            { 
                status: 400,
                headers: getResponseHeaders()
            }
        );
    }

    try {
        await connectDB();
        
        // Find the like document
        const like = await Like.findOne({ blogId, userId });
        
        // Log the query result for debugging
        console.log(`Check like - Blog: ${blogId}, User: ${userId}, Found: ${!!like}`);
        
        // Return response based on whether the like exists
        return NextResponse.json(
            {
                success: true,
                isLiked: !!like,
                like: like || null
            },
            {
                status: 200,
                headers: getResponseHeaders()
            }
        );
        
    } catch (err) {
        console.error('Error in check-like endpoint:', {
            error: err.message,
            stack: err.stack,
            blogId,
            userId
        });
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to check like status',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            },
            { 
                status: 400,
                headers: getResponseHeaders()
            }
        );
    }
};