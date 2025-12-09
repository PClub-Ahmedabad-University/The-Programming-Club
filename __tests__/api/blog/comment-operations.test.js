import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Comment from '../../../src/app/api/models/comment.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestUser } from '../../utils/testHelpers.js';

describe('Comments API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/blog/[blogId]/comments - Create Comment', () => {
    test('should create comment with author', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'Great post!',
        author: 'John Doe',
        isAnonymous: false,
      });

      expect(comment._id).toBeDefined();
      expect(comment.userId.toString()).toBe(user._id.toString());
      expect(comment.content).toBe('Great post!');
      expect(comment.author).toBe('John Doe');
      expect(comment.isAnonymous).toBe(false);
    });

    test('should create anonymous comment', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'Anonymous feedback',
        isAnonymous: true,
      });

      expect(comment.isAnonymous).toBe(true);
      expect(comment.author).toBeUndefined();
    });

    test('should fail without required userId', async () => {
      await expect(
        Comment.create({
          content: 'Test comment',
          author: 'John',
        })
      ).rejects.toThrow();
    });

    test('should fail without required content', async () => {
      const user = await createTestUser();
      
      await expect(
        Comment.create({
          userId: user._id,
          author: 'John',
        })
      ).rejects.toThrow();
    });

    test('should trim content', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: '  Trimmed content  ',
        author: 'John',
      });

      expect(comment.content).toBe('Trimmed content');
    });

    test('should default isAnonymous to false', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'Test',
        author: 'John',
      });

      expect(comment.isAnonymous).toBe(false);
    });

    test('should default comments array to empty', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'Test',
        author: 'John',
      });

      expect(Array.isArray(comment.comments)).toBe(true);
      expect(comment.comments).toHaveLength(0);
    });
  });

  describe('GET /api/blog/[blogId]/comments - Get Comments', () => {
    test('should return empty array when no comments', async () => {
      const comments = await Comment.find({});
      expect(Array.isArray(comments)).toBe(true);
      expect(comments).toHaveLength(0);
    });

    test('should get all comments for a user', async () => {
      const user = await createTestUser();
      
      await Comment.create({
        userId: user._id,
        content: 'Comment 1',
        author: 'John',
      });
      await Comment.create({
        userId: user._id,
        content: 'Comment 2',
        author: 'John',
      });

      const comments = await Comment.find({ userId: user._id });
      expect(comments).toHaveLength(2);
    });

    test('should filter anonymous comments', async () => {
      const user = await createTestUser();
      
      await Comment.create({
        userId: user._id,
        content: 'Public comment',
        author: 'John',
        isAnonymous: false,
      });
      await Comment.create({
        userId: user._id,
        content: 'Anonymous comment',
        isAnonymous: true,
      });

      const anonComments = await Comment.find({ isAnonymous: true });
      expect(anonComments).toHaveLength(1);
      expect(anonComments[0].content).toBe('Anonymous comment');
    });
  });

  describe('Nested Comments (Replies)', () => {
    test('should add reply to comment', async () => {
      const user = await createTestUser();
      
      const parentComment = await Comment.create({
        userId: user._id,
        content: 'Parent comment',
        author: 'John',
      });

      const replyComment = await Comment.create({
        userId: user._id,
        content: 'Reply comment',
        author: 'Jane',
      });

      const updated = await Comment.findByIdAndUpdate(
        parentComment._id,
        { $push: { comments: replyComment._id } },
        { new: true }
      );

      expect(updated.comments).toHaveLength(1);
      expect(updated.comments[0].toString()).toBe(replyComment._id.toString());
    });

    test('should support multiple replies', async () => {
      const user = await createTestUser();
      
      const parentComment = await Comment.create({
        userId: user._id,
        content: 'Parent',
        author: 'John',
      });

      const reply1 = await Comment.create({
        userId: user._id,
        content: 'Reply 1',
        author: 'Jane',
      });

      const reply2 = await Comment.create({
        userId: user._id,
        content: 'Reply 2',
        author: 'Bob',
      });

      await Comment.findByIdAndUpdate(
        parentComment._id,
        { $push: { comments: { $each: [reply1._id, reply2._id] } } }
      );

      const updated = await Comment.findById(parentComment._id);
      expect(updated.comments).toHaveLength(2);
    });
  });

  describe('Update Comment', () => {
    test('should update comment content', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'Old content',
        author: 'John',
      });

      const updated = await Comment.findByIdAndUpdate(
        comment._id,
        { content: 'New content' },
        { new: true }
      );

      expect(updated.content).toBe('New content');
    });
  });

  describe('DELETE /api/blog/comments/[commentId] - Delete Comment', () => {
    test('should delete comment', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'To delete',
        author: 'John',
      });

      await Comment.findByIdAndDelete(comment._id);

      const found = await Comment.findById(comment._id);
      expect(found).toBeNull();
    });
  });

  describe('Timestamps', () => {
    test('should auto-set createdAt timestamp', async () => {
      const user = await createTestUser();
      
      const comment = await Comment.create({
        userId: user._id,
        content: 'Test',
        author: 'John',
      });

      expect(comment.createdAt).toBeDefined();
      expect(comment.createdAt).toBeInstanceOf(Date);
    });
  });
});
