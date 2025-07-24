import { addCommentToBlog } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
// POST: Add a comment to a blog
export const POST = async (req, { params }) => {
    const { id } = params;
    const { userId, content, isAnonymous, author } = await req.json();

    try {
        const comment = await addCommentToBlog(
            id,{
            userId,
            content,
            isAnonymous,
            author
        });
        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// Request type : POST
// example url : http://localhost:3000/api/blog/688215633846311c68924d1c/comments/add
// http://localhost:3000/api/blog/{blogId}/comments/add
// example req body : 
// {
//   "blogId": "688215633846311c68924d1c",
//   "content": "This is a test comment!",
//   "userId" : "687fb737e2acada77c80ae0f",
//   "isAnonymous": true,
//.  "author" : authorname
//   "author": "test"
// }

// example response body 

// {
//     "userId": "687fb737e2acada77c80ae0f",
//     "content": "This is a test comment!",
//     "isAnonymous": true,
//     "createdAt": "2025-07-24T11:16:19.643Z",
//     "_id": "68821603c47d5af0f72679d7"
// }