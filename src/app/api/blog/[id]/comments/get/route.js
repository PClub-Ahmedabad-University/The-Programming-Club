import { getCommentsForBlog } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
// GET: Retrieve all comments for a blog
export const GET = async (req, { params }) => {
    try {
        const blogId = params.id;
        if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
        return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
        }
        const comments = await getCommentsForBlog(blogId);
        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}  

// Req type : GET
// http://localhost:3000/api/blog/{BlogId}/comments/get
// example response 
// [
//     {
//         "userId": "687fb737e2acada77c80ae0f",
//         "content": "Updated erer text!",
//         "isAnonymous": false,
//         "createdAt": "2025-07-24T11:16:15.722Z",
//         "_id": "688215ffc47d5af0f72679d3",
//         "author": "Updated Name"
//     },
//     {
//         "userId": "687fb737e2acada77c80ae0f",
//         "content": "This is a test comment!",
//         "isAnonymous": true,
//         "createdAt": "2025-07-24T11:16:19.643Z",
//         "_id": "68821603c47d5af0f72679d7"
//     }
// ]