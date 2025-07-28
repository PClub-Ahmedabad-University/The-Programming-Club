import { getCommentsForBlog } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
// GET: Retrieve all comments for a blog
export const GET = async (_req, { params }) => {
    try {
        const awaitedParams = await params;
        console.log(awaitedParams);
        const blogId = awaitedParams.id;
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
//         "_id": "688313c6e74009f2cd9fb7fa",
//         "userId": "687fb737e2acada77c80ae0f",
//         "content": "This is a test comment!",
//         "isAnonymous": false,
//         "author": "test",
//         "comments": [
//             {
//                 "_id": "68831499e74009f2cd9fb7fd",
//                 "userId": "687fb737e2acada77c80ae0f",
//                 "content": "This is a test comment!",
//                 "isAnonymous": false,
//                 "author": "test",
//                 "comments": [],
//                 "createdAt": "2025-07-25T05:22:33.920Z",
//                 "__v": 0
//             },
//             {
//                 "_id": "688314dce74009f2cd9fb80c",
//                 "userId": "687fb737e2acada77c80ae0f",
//                 "content": "This is a excellent comment!",
//                 "isAnonymous": false,
//                 "author": "test",
//                 "comments": [
//                     {
//                         "_id": "688314e3e74009f2cd9fb810",
//                         "userId": "687fb737e2acada77c80ae0f",
//                         "content": "This is a excellent comment!",
//                         "isAnonymous": false,
//                         "author": "test",
//                         "comments": [
//                             {
//                                 "_id": "688314e8e74009f2cd9fb814",
//                                 "userId": "687fb737e2acada77c80ae0f",
//                                 "content": "This is a excellent comment!",
//                                 "isAnonymous": false,
//                                 "author": "test",
//                                 "comments": [],
//                                 "createdAt": "2025-07-25T05:23:52.829Z",
//                                 "__v": 0
//                             }
//                         ],
//                         "createdAt": "2025-07-25T05:23:47.693Z",
//                         "__v": 1
//                     }
//                 ],
//                 "createdAt": "2025-07-25T05:23:40.322Z",
//                 "__v": 1
//             }
//         ],
//         "createdAt": "2025-07-25T05:19:02.723Z",
//         "__v": 2
//     },
//     {
//         "_id": "688314cce74009f2cd9fb805",
//         "userId": "687fb737e2acada77c80ae0f",
//         "content": "This is a new comment!",
//         "isAnonymous": false,
//         "author": "test",
//         "comments": [],
//         "createdAt": "2025-07-25T05:23:24.340Z",
//         "__v": 0
//     },
//     {
//         "_id": "688314d1e74009f2cd9fb809",
//         "userId": "687fb737e2acada77c80ae0f",
//         "content": "This is a good comment!",
//         "isAnonymous": false,
//         "author": "test",
//         "comments": [],
//         "createdAt": "2025-07-25T05:23:29.623Z",
//         "__v": 0
//     }
// ]