import connectDB from "../lib/db.js";
import Blog from "../models/blog.model.js";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import { Comme } from "next/font/google/index.js";
import Comment from "../models/comment.model.js";
const slugify = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
//-------------------------------------------------------------------------------------------------------
// POST: Create new blog
export const postNewBlog = async (req) => {
  await connectDB();

  const { title, content, tags, isAnonymous, author } = req;

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const blog = await Blog.create({
    title,
    slug: slugify(title),
    userId: req.userId,
    content,
    tags: tags || [],
    isAnonymous: isAnonymous ?? true,
    author: isAnonymous ? undefined : author,
  });

  return blog;
};
//-------------------------------------------------------------------------------------------------------
// PATCH: Update a blog by ID
export const patchBlog = async (id, data) => {
  await connectDB();
  const { title, content, tags, published } = data;

  const blog = await Blog.findById(id);
  if (!blog) throw new Error("Blog not found.");

  if (title) {
    blog.title = title;
    blog.slug = slugify(title);
  }
  if (content) blog.content = content;
  if (tags) blog.tags = tags;
  if (published !== undefined) blog.published = published;

  blog.updatedAt = new Date();

  await blog.save();
  return blog;
};

//-------------------------------------------------------------------------------------------------------
// DELETE: Delete a blog by ID
export const deleteBlog = async (id, req) => {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid blog ID');
    }

    // Extract token from headers
    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No auth header or invalid format:', authHeader);
      throw new Error('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('No token found in auth header');
      throw new Error('Authentication token missing');
    }

    await connectDB();
    
    // Verify and decode token
    let userData;
    try {
      userData = jwt.decode(token);
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid or expired token');
    }

    const role = userData?.role;
    const userId = userData?.id || userData?._id;
    
    if (!role || !userId) {
      console.error('Missing required user data in token. Token data:', userData);
      throw new Error('Invalid user data in token');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error('Blog not found');
    }

    // If blog is by The Programming Club, only admin can delete
    if (blog.author === 'The Programming Club') {
      if (role !== 'admin') {
        throw new Error('Only administrators can delete Programming Club blogs');
      }
    } 

    
    // Convert both IDs to strings for comparison
    const userIdStr = userId.toString();
    const blogUserIdStr = blog.userId.toString();
    
    if (blogUserIdStr !== userIdStr || role !== "admin") {
      console.error(`User ID mismatch: ${userIdStr} (user) vs ${blogUserIdStr} (blog)`);
      throw new Error('You are not authorized to delete this blog');
    }
    const result = await Blog.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new Error('Failed to delete blog');
    }

    return { 
      success: true,
      message: 'Blog deleted successfully' 
    };
  } catch (error) {
    console.error('Error in deleteBlog:', error);
    throw new Error(error.message || 'Failed to delete blog');
  }
};
//-------------------------------------------------------------------------------------------------------
// GET: Get all published blogs
export const getAllBlogs = async () => {
  await connectDB();
  
  const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
  return blogs;
};
//-------------------------------------------------------------------------------------------------------
// GET: Get blog by ID
export const getBlogById = async (req) => {
  await connectDB();
  const blog = await Blog.findById(req);
  if (!blog) throw new Error("Blog not found.");

  return blog;
};
//-------------------------------------------------------------------------------------------------------
// GET: Get blogs by tag
export const getBlogsByTags = async (req) => {
  await connectDB();
  const { tags } = req;
  const blogs = await Blog.find({ tags: { $in: tags }, published: true });
  return blogs;
};
//-------------------------------------------------------------------------------------------------------
//Get blog by userMail/author
export const getBlogByAuthor = async (req) => {
  await connectDB();
  console.log(req);
  const blogs = await Blog.find({"author" : req});
  if (!blogs) throw new Error("No blogs found");
  return blogs;
};

//-------------------------------------------------------------------------------------------------------
// POST: Add a comment to a blog
export const addCommentToBlog = async (blogId, commentData) => {
  await connectDB();
  console.log(blogId);
  if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error('Invalid blog ID');
  }
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');
  // console.log('>>> blog.userId:', blog.userId); // this must exist
  // console.log('>>> blog.title:', blog.title); // verify blog shape
  // commentData: { userId, content, isAnonymous, author }
  if (!commentData || !commentData.userId || !commentData.content) {
    throw new Error('userId and content are required for a comment');
  }
  // console.log(commentData);
    const newComment = await Comment.create({
      userId: commentData.userId,
      content: commentData.content,
      isAnonymous: commentData.isAnonymous ?? false,
      author: commentData.isAnonymous ? undefined : commentData.author,
      createdAt: new Date()
    });
    blog.comments.push(newComment._id);
    await blog.save();
    return newComment;
};
//-------------------------------------------------------------------------------------------------------
// DELETE: Delete a comment from a blog
export const deleteCommentFromBlog = async (blogId, commentId, userId, role) => {
  await connectDB();
  if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error('Invalid blog ID');
  }
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new Error('Invalid comment ID');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  if (comment.userId.toString() !== userId.toString() && role !== 'admin') {
    throw new Error('You are not authorized to delete this comment');
  }

  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');
  blog.comments = blog.comments.filter(
    (cId) => cId.toString() !== commentId.toString()
  );
  await blog.save();
  await Comment.deleteOne({ _id: commentId });
  return { success: true, message: 'Comment deleted successfully' };
};

//-------------------------------------------------------------------------------------------------------
// GET: Get all comments for a blog
async function populateCommentTree(commentId) {
  let comment = await Comment.findById(commentId).populate("userId", "name"); // Removed lean
  if (!comment) return null;

  // Convert comment to object, instead of using lean
  comment = comment.toObject();
  
  if (comment.comments && comment.comments.length > 0) {
    comment.comments = await Promise.all(
      comment.comments.map(childId => populateCommentTree(childId))
    );
  }
  return comment;
}
export const getCommentsForBlog = async (blogId) => {
  await connectDB();
  if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error('Invalid blog ID');
  }
  const blog = await Blog.findById(blogId).lean();
  if (!blog) throw new Error('Blog not found');
  const fullComments = await Promise.all(
    (blog.comments || []).map(commentId => populateCommentTree(commentId))
  );
  console.log(fullComments);
  return fullComments;
};
//-------------------------------------------------------------------------------------------------------
// PATCH: Edit a comment on a blog
export const editCommentOnBlog = async (commentId, userId, role, updateData) => {
  await connectDB();
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new Error('Invalid comment ID');
  }
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  if (comment.userId.toString() !== userId.toString() && role !== 'admin') {
    throw new Error('You are not authorized to edit this comment');
  }
  if (updateData.content) comment.content = updateData.content;
  if (updateData.isAnonymous !== undefined) comment.isAnonymous = updateData.isAnonymous;
  if (updateData.author !== undefined) comment.author = updateData.author;
  await comment.save();
  return comment;
};


export const addReplyToComment = async (parentCommentId, replyData) => {

  await connectDB(); 
  if (!parentCommentId || !mongoose.Types.ObjectId.isValid(parentCommentId)) {
    throw new Error('Invalid parent comment ID');
  }
  if (!replyData || !replyData.userId || !replyData.content) {
    throw new Error('userId and content are required for a reply');
  }

  const newReply = await Comment.create({
    userId: replyData.userId,
    content: replyData.content,
    isAnonymous: replyData.isAnonymous ?? false,
    author: replyData.isAnonymous ? undefined : replyData.author,
    createdAt: new Date()
  });

  const parentComment = await Comment.findById(parentCommentId);
  if (!parentComment) throw new Error('Parent comment not found');
  parentComment.comments.push(newReply._id);
  await parentComment.save();

  return newReply;
};



export const deleteCommentFromComment = async (parentCommentId, commentId, userId, role) => {
  await connectDB();
  if (!parentCommentId || !mongoose.Types.ObjectId.isValid(parentCommentId)) {
    throw new Error('Invalid parent comment ID');
  }
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new Error('Invalid comment ID');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  if (comment.userId.toString() !== userId.toString() && role !== 'admin') {
    throw new Error('You are not authorized to delete this comment');
  }

  const parentComment = await Comment.findById(parentCommentId);
  if (!parentComment) throw new Error('Parent comment not found');
  parentComment.comments = parentComment.comments.filter(
    (cId) => cId.toString() !== commentId.toString()
  );
  await parentComment.save();
  await Comment.deleteOne({ _id: commentId });
  return { success: true, message: 'Comment deleted successfully' };
};