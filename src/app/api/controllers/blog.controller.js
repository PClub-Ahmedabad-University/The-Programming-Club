import connectDB from "../lib/db.js";
import Blog from "../models/blog.model.js";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

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
    console.log("AuthHeader",authHeader);
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
      console.log('Decoded token data:', userData);
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
    console.log("User ID", userId);
    console.log("Blog User ID", blog.userId);
    
    // Convert both IDs to strings for comparison
    const userIdStr = userId.toString();
    const blogUserIdStr = blog.userId.toString();
    
    if (blogUserIdStr !== userIdStr) {
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
  const comment = {
    userId: commentData.userId,
    content: commentData.content,
    isAnonymous: commentData.isAnonymous ?? false,
    author: commentData.isAnonymous ? undefined : commentData.author,
    createdAt: new Date()
  };
  blog.comments.push(comment);
  await blog.save();
  return blog.comments[blog.comments.length - 1];
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
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');
  const comment = blog.comments.id(commentId);
  if (!comment) throw new Error('Comment not found');

  // Only comment author or admin can delete
  if (comment.userId.toString() !== userId.toString() && role !== 'admin') {
    throw new Error('You are not authorized to delete this comment');
  }
  comment.deleteOne();
  await blog.save();
  return { success: true, message: 'Comment deleted successfully' };
};

//-------------------------------------------------------------------------------------------------------
// GET: Get all comments for a blog
export const getCommentsForBlog = async (blogId) => {
  await connectDB();
  if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error('Invalid blog ID');
  }
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');
  return blog.comments;
};

//-------------------------------------------------------------------------------------------------------
// PATCH: Edit a comment on a blog
export const editCommentOnBlog = async (blogId, commentId, userId, role, updateData) => {
  await connectDB();
  if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error('Invalid blog ID');
  }
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new Error('Invalid comment ID');
  }
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');
  const comment = blog.comments.id(commentId);
  if (!comment) throw new Error('Comment not found');
  // console.log(comment.userId);
  if (comment.userId.toString() !== userId.toString() && role !== 'admin') {
    throw new Error('You are not authorized to edit this comment');
  }
  if (updateData.content) comment.content = updateData.content;
  if (updateData.isAnonymous !== undefined) comment.isAnonymous = updateData.isAnonymous;
  if (updateData.author !== undefined) comment.author = updateData.author;
  await blog.save();
  return comment;
};