import { createLike} from "@/app/api/controllers/like.controller";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { blogId, userId } = params;

    const result = await createLike(blogId, userId);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
