import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Blog from '../../../src/app/api/models/blog.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestUser } from '../../utils/testHelpers.js';

describe('Blog API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/blog - Create Blog', () => {
    test('should create blog with all required fields', async () => {
      const user = await createTestUser();
      const blogData = {
        title: 'My First Blog Post',
        slug: 'my-first-blog-post',
        userId: user._id,
        content: 'This is the content of my blog post',
        isAnonymous: false,
        author: 'John Doe',
      };

      const blog = await Blog.create(blogData);
      expect(blog._id).toBeDefined();
      expect(blog.title).toBe('My First Blog Post');
      expect(blog.slug).toBe('my-first-blog-post');
      expect(blog.content).toBe('This is the content of my blog post');
    });

    test('should create anonymous blog', async () => {
      const user = await createTestUser();
      const blogData = {
        title: 'Anonymous Post',
        slug: 'anonymous-post',
        userId: user._id,
        content: 'Anonymous content',
        isAnonymous: true,
      };

      const blog = await Blog.create(blogData);
      expect(blog.isAnonymous).toBe(true);
      expect(blog.author).toBeUndefined();
    });

    test('should fail without required title', async () => {
      const user = await createTestUser();
      const blogData = {
        slug: 'test-slug',
        userId: user._id,
        content: 'Test content',
      };

      await expect(Blog.create(blogData)).rejects.toThrow();
    });

    test('should fail without required slug', async () => {
      const user = await createTestUser();
      const blogData = {
        title: 'Test Title',
        userId: user._id,
        content: 'Test content',
      };

      await expect(Blog.create(blogData)).rejects.toThrow();
    });

    test('should fail without required userId', async () => {
      const blogData = {
        title: 'Test Title',
        slug: 'test-slug',
        content: 'Test content',
      };

      await expect(Blog.create(blogData)).rejects.toThrow();
    });

    test('should fail without required content', async () => {
      const user = await createTestUser();
      const blogData = {
        title: 'Test Title',
        slug: 'test-slug',
        userId: user._id,
      };

      await expect(Blog.create(blogData)).rejects.toThrow();
    });

    test('should default published to true', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test',
        slug: 'test',
        userId: user._id,
        content: 'Content',
      });

      expect(blog.published).toBe(true);
    });

    test('should default tags to empty array', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test',
        slug: 'test',
        userId: user._id,
        content: 'Content',
      });

      expect(blog.tags).toEqual([]);
    });

    test('should allow adding tags', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test',
        slug: 'test',
        userId: user._id,
        content: 'Content',
        tags: ['javascript', 'react', 'nodejs'],
      });

      expect(blog.tags).toHaveLength(3);
      expect(blog.tags).toContain('javascript');
    });

    test('should have timestamps', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test',
        slug: 'test',
        userId: user._id,
        content: 'Content',
      });

      expect(blog.createdAt).toBeDefined();
      expect(blog.updatedAt).toBeDefined();
    });
  });

  describe('GET /api/blog - Get All Blogs', () => {
    test('should return empty array when no blogs exist', async () => {
      const blogs = await Blog.find({});
      expect(Array.isArray(blogs)).toBe(true);
      expect(blogs).toHaveLength(0);
    });

    test('should return all blogs', async () => {
      const user = await createTestUser();
      await Blog.create({
        title: 'Blog 1',
        slug: 'blog-1',
        userId: user._id,
        content: 'Content 1',
      });
      await Blog.create({
        title: 'Blog 2',
        slug: 'blog-2',
        userId: user._id,
        content: 'Content 2',
      });

      const blogs = await Blog.find({});
      expect(blogs).toHaveLength(2);
    });

    test('should filter published blogs', async () => {
      const user = await createTestUser();
      await Blog.create({
        title: 'Published',
        slug: 'published',
        userId: user._id,
        content: 'Published content',
        published: true,
      });
      await Blog.create({
        title: 'Draft',
        slug: 'draft',
        userId: user._id,
        content: 'Draft content',
        published: false,
      });

      const published = await Blog.find({ published: true });
      expect(published).toHaveLength(1);
      expect(published[0].title).toBe('Published');
    });

    test('should filter blogs by tag', async () => {
      const user = await createTestUser();
      await Blog.create({
        title: 'React Blog',
        slug: 'react-blog',
        userId: user._id,
        content: 'React content',
        tags: ['react', 'frontend'],
      });
      await Blog.create({
        title: 'Node Blog',
        slug: 'node-blog',
        userId: user._id,
        content: 'Node content',
        tags: ['nodejs', 'backend'],
      });

      const reactBlogs = await Blog.find({ tags: 'react' });
      expect(reactBlogs).toHaveLength(1);
      expect(reactBlogs[0].title).toBe('React Blog');
    });
  });

  describe('GET /api/blog/[id] - Get Blog by ID', () => {
    test('should find blog by ID', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test Blog',
        slug: 'test-blog',
        userId: user._id,
        content: 'Test content',
      });

      const found = await Blog.findById(blog._id);
      expect(found).toBeDefined();
      expect(found.title).toBe('Test Blog');
    });

    test('should find blog by slug', async () => {
      const user = await createTestUser();
      await Blog.create({
        title: 'Unique Blog',
        slug: 'unique-blog-slug',
        userId: user._id,
        content: 'Unique content',
      });

      const found = await Blog.findOne({ slug: 'unique-blog-slug' });
      expect(found).toBeDefined();
      expect(found.title).toBe('Unique Blog');
    });

    test('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const blog = await Blog.findById(fakeId);
      expect(blog).toBeNull();
    });
  });

  describe('Update Blog', () => {
    test('should update blog content', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Original Title',
        slug: 'original-slug',
        userId: user._id,
        content: 'Original content',
      });

      const updated = await Blog.findByIdAndUpdate(
        blog._id,
        { content: 'Updated content' },
        { new: true }
      );

      expect(updated.content).toBe('Updated content');
    });

    test('should update blog tags', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test',
        slug: 'test',
        userId: user._id,
        content: 'Content',
        tags: ['old-tag'],
      });

      const updated = await Blog.findByIdAndUpdate(
        blog._id,
        { tags: ['new-tag-1', 'new-tag-2'] },
        { new: true }
      );

      expect(updated.tags).toHaveLength(2);
      expect(updated.tags).toContain('new-tag-1');
    });

    test('should update published status', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'Test',
        slug: 'test',
        userId: user._id,
        content: 'Content',
        published: true,
      });

      const updated = await Blog.findByIdAndUpdate(
        blog._id,
        { published: false },
        { new: true }
      );

      expect(updated.published).toBe(false);
    });
  });

  describe('Delete Blog', () => {
    test('should delete blog', async () => {
      const user = await createTestUser();
      const blog = await Blog.create({
        title: 'To Delete',
        slug: 'to-delete',
        userId: user._id,
        content: 'Delete me',
      });

      await Blog.findByIdAndDelete(blog._id);

      const found = await Blog.findById(blog._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await Blog.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });

  describe('Blog by User', () => {
    test('should find blogs by userId', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });

      await Blog.create({
        title: 'User 1 Blog',
        slug: 'user-1-blog',
        userId: user1._id,
        content: 'Content 1',
      });
      await Blog.create({
        title: 'User 2 Blog',
        slug: 'user-2-blog',
        userId: user2._id,
        content: 'Content 2',
      });

      const user1Blogs = await Blog.find({ userId: user1._id });
      expect(user1Blogs).toHaveLength(1);
      expect(user1Blogs[0].title).toBe('User 1 Blog');
    });
  });
});
