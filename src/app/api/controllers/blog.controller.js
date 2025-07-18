import connectDB from "../lib/db.js";
import Blog from "../models/blog.model.js";
import mongoose from 'mongoose';
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
export const deleteBlog = async (req) => {
  await connectDB();

  // const { id } = req;
  const blog = await Blog.findByIdAndDelete(req);
  if (!blog) throw new Error("Blog not found.");

  return { message: "Blog deleted successfully." };
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

  // const { id } = req;
  // console.log(req);
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