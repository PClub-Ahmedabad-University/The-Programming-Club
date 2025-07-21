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