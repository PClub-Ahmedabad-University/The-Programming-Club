import { NextResponse } from "next/server";
import Like from "@/app/api/models/likes.model";
import connectDB from "@/app/api/lib/db";

export const POST = async (req, { params }) => {
    try {
        await connectDB();
        const result = await Like.findOne({ blogId: params.blogId, userId: params.userId });
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
};