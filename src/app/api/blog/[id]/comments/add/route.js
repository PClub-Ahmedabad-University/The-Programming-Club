import { addCommentToBlog, addReplyToComment } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
export const POST = async (req, { params }) => {
    awaitedParams = await params;
    const { id } = awaitedParams;
    const { userId, content, isAnonymous, author, parentCommentId } = await req.json();
    if(parentCommentId) {
        try {
            const comment = await addReplyToComment( parentCommentId, {
                userId,
                content,
                isAnonymous,
                author
            });
            return NextResponse.json(comment, { status: 201 });
        } catch(e) {
            return NextResponse.json({ error: e.message }, { status: 500 });    
        }
    } else {
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
}
// Request type : POST

// ADDING THE FIRST COMMENT TO THE BLOG (PARENT COMMENT)
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



// ADDING THE REPLY TO A COMMENT OR COMMENT TO A COMMENT (NESTED!!!!)
// http://localhost:3000/api/blog/{blogId}/comments/add
// {
//   "blogId": "688215633846311c68924d1c",
//   "content": "This is a excellent comment!",
//   "userId" : "687fb737e2acada77c80ae0f",
//   "isAnonymous": false,
//   "author": "test",
//   "parentCommentId" : "688314e3e74009f2cd9fb810"
// }
// example response body :
// {
//     "userId": "687fb737e2acada77c80ae0f",
//     "content": "This is a excellent comment!",
//     "isAnonymous": false,
//     "author": "test",
//     "comments": [],
//     "createdAt": "2025-07-25T05:23:52.829Z",
//     "_id": "688314e8e74009f2cd9fb814",
//     "__v": 0
// }