import { postNewBlog, getAllBlogs } from "../controllers/blog.controller";
import { NextResponse } from "next/server";
export const POST = async (req) => {
  try {
    const data = await req.json();
    const result = await postNewBlog(data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

export const GET = async () => {
  try {
    const result = await getAllBlogs();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};
