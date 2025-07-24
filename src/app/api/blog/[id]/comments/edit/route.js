import { editCommentOnBlog } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from "mongoose";  
export const PATCH = async (request, { params }) => {
    try {
        const { id } = params;
        const data = await request.json();
        console.log(data);
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
        }
        if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        const updatedComment = await editCommentOnBlog(id, data.commentId, data.userId, data.role, data);
        return NextResponse.json(updatedComment, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
//req type :  PATCH
//req url : http://localhost:3000/api/blog/{blogId}/comments/edit
//req body :
// {
//   "commentId": "688215ffc47d5af0f72679d3",
//   "userId": "687fb737e2acada77c80ae0f",
//   "role": "user",
//   "content": "Updated erer text!",
//   "isAnonymous": false,
//   "author": "Updated Name"
// }

// example response 
// {
//     "userId": "687fb737e2acada77c80ae0f",
//     "content": "Updated erer text!",
//     "isAnonymous": false,
//     "createdAt": "2025-07-24T11:16:15.722Z",
//     "_id": "688215ffc47d5af0f72679d3",
//     "author": "Updated Name"
// }