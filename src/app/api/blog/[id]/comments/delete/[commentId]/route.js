import { deleteCommentFromBlog } from "@/app/api/controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
// DELETE: Delete a comment from a blog
export const DELETE = async (req, { params }) => {
    try {
        const { id: blogId, commentId } = params;
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
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// request type : DELETE
// example request url: http://localhost:3000/api/blog/688215633846311c68924d1c/comments/delete/688215ffc47d5af0f72679d3
// http://localhost:3000/api/blog/{blogId}/comments/delete/{commentId}
// example headers: { user-id: '665f0b1c2a1b2c3d4e5f6789', role: 'user' }
// example response: { success: true, message: 'Comment deleted successfully' }
// example response when comment not found: { error: 'Comment not found' }
// example response when blog not found: { error: 'Blog not found' }
// example response when invalid blog ID: { error: 'Invalid blog ID' }
// example response when invalid comment ID: { error: 'Invalid comment ID' }
// example response when not authorized: { error: 'You are not authorized to delete this comment    