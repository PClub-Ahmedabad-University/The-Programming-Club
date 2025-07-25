import { deleteCommentFromBlog, deleteCommentFromComment } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
// DELETE: Delete a comment from a blog
export const DELETE = async (req, { params }) => {
    try {
        const parentCommentId = req.headers.get('parent-comment-id');
        const { id: blogId, commentId } = params;
        if(parentCommentId) {
            if (parentCommentId === "null" || parentCommentId === "undefined") {
                return NextResponse.json({ error: 'Parent comment ID is required' }, { status: 400 });
            }
            if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
                return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
            }
            if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
                return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
            }
            if (!parentCommentId || !mongoose.Types.ObjectId.isValid(parentCommentId)) {
                return NextResponse.json({ error: 'Invalid parent comment ID' }, { status: 400 });
            }
            const userId = req.headers.get('user-id'); 
            const role = req.headers.get('role'); 
            const updatedComment = await deleteCommentFromComment(parentCommentId, commentId, userId, role);
            return NextResponse.json(updatedComment, { status: 200 });
        } else {
            if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
                return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
            }
            if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
                return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
            }
    
            const userId = req.headers.get('user-id'); // Assuming user ID is passed in headers
            const role = req.headers.get('role'); // Assuming role is passed in headers
            console.log(blogId);
            console.log(commentId); 
            const updatedBlog = await deleteCommentFromBlog(blogId, commentId, userId, role);
            return NextResponse.json(updatedBlog, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// request type : DELETE

// Delete a top-level comment from a blog:
// Example request URL:
//   http://localhost:3000/api/blog/688215633846311c68924d1c/comments/delete/688215ffc47d5af0f72679d3
// Example headers:
//   { user-id: '665f0b1c2a1b2c3d4e5f6789', role: 'user' }

// Delete a reply (nested comment) from a parent comment:
// Example request URL:
//   http://localhost:3000/api/blog/688215633846311c68924d1c/comments/delete/688215ffc47d5af0f72679d3
// Example headers:
//   { user-id: '665f0b1c2a1b2c3d4e5f6789', role: 'user', parent-comment-id: '688215ffc47d5af0f72679d2' }

// Example successful response:
//   { "success": true, "message": "Comment deleted successfully" }

// Example error responses:
//   { "error": "Comment not found" }
//   { "error": "Blog not found" }
//   { "error": "Parent comment not found" }
//   { "error": "Invalid blog ID" }
//   { "error": "Invalid comment ID" }
//   { "error": "Invalid parent comment ID" }
//   { "error": "You are not authorized to delete this comment" }