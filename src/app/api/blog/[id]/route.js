import { getBlogById, patchBlog, deleteBlog } from "../../controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
export const GET = async (req, { params }) => {
  try {
    const awaitedParams = await params;
    const result = await getBlogById(awaitedParams.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

export const PATCH = async (req, { params }) => {
  try {
    const data = await req.json();
    const awaitedParams = await params;
    if (!mongoose.Types.ObjectId.isValid(awaitedParams.id)) {
    throw new Error('Invalid blog ID.');
    }
    const result = await patchBlog(awaitedParams.id, data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

export const DELETE = async (req, { params }) => {
  try {
    await deleteBlog(params.id);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};
