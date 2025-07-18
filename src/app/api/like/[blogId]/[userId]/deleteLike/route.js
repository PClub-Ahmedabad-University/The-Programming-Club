import { deleteLike } from "../../../../controllers/like.controller";
import { NextResponse } from "next/server";

export const POST = async (req, { params }) => {
    try {
        const result = await deleteLike({blogId: params.blogId, userId: params.userId});
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
};