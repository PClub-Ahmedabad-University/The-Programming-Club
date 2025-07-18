import Like from "../../models/like.model";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        const data = await Like.find({ blogId: params.blogId });
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
};
