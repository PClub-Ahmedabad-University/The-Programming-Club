import { createLike } from "../../../../controllers/like.controller";
import { NextResponse } from "next/server";

export const POST = async (req, { params }) => {
    try {
        const result = await createLike({blogId: params.blogId, userId: params.userId});
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
};