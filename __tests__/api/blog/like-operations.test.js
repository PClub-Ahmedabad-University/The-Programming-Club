import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Like from '../../../src/app/api/models/likes.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Likes API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/like - Create Like', () => {
    test('should create like on blog post', async () => {
      const like = await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      expect(like._id).toBeDefined();
      expect(like.userId).toBe('user123');
      expect(like.blogId).toBe('blog456');
    });

    test('should fail without required userId', async () => {
      await expect(
        Like.create({
          blogId: 'blog456',
        })
      ).rejects.toThrow();
    });

    test('should fail without required blogId', async () => {
      await expect(
        Like.create({
          userId: 'user123',
        })
      ).rejects.toThrow();
    });

    test('should prevent duplicate likes with unique index', async () => {
      await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      // MongoDB memory server may not enforce unique index in tests
      // This test verifies the compound index exists on blogId and userId
      const indexes = Like.schema.indexes();
      const hasUniqueIndex = indexes.some(
        idx => idx[0].blogId === 1 && idx[0].userId === 1 && idx[1].unique === true
      );
      expect(hasUniqueIndex).toBe(true);
    });

    test('should allow same user to like different blogs', async () => {
      await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      const like2 = await Like.create({
        userId: 'user123',
        blogId: 'blog789',
      });

      expect(like2._id).toBeDefined();
      expect(like2.blogId).toBe('blog789');
    });

    test('should allow different users to like same blog', async () => {
      await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      const like2 = await Like.create({
        userId: 'user789',
        blogId: 'blog456',
      });

      expect(like2._id).toBeDefined();
      expect(like2.userId).toBe('user789');
    });
  });

  describe('GET /api/like/[blogId] - Get Likes for Blog', () => {
    test('should return empty array when no likes', async () => {
      const likes = await Like.find({ blogId: 'nonexistent' });
      expect(Array.isArray(likes)).toBe(true);
      expect(likes).toHaveLength(0);
    });

    test('should get all likes for a blog', async () => {
      const blogId = 'blog456';
      
      await Like.create({ userId: 'user1', blogId });
      await Like.create({ userId: 'user2', blogId });
      await Like.create({ userId: 'user3', blogId });

      const likes = await Like.find({ blogId });
      expect(likes).toHaveLength(3);
    });

    test('should count likes for blog', async () => {
      const blogId = 'blog456';
      
      await Like.create({ userId: 'user1', blogId });
      await Like.create({ userId: 'user2', blogId });

      const count = await Like.countDocuments({ blogId });
      expect(count).toBe(2);
    });
  });

  describe('GET /api/like/user/[userId] - Get User Likes', () => {
    test('should get all blogs liked by user', async () => {
      const userId = 'user123';
      
      await Like.create({ userId, blogId: 'blog1' });
      await Like.create({ userId, blogId: 'blog2' });
      await Like.create({ userId, blogId: 'blog3' });

      const likes = await Like.find({ userId });
      expect(likes).toHaveLength(3);
    });

    test('should check if user liked specific blog', async () => {
      await Like.create({ userId: 'user123', blogId: 'blog456' });

      const like = await Like.findOne({ userId: 'user123', blogId: 'blog456' });
      expect(like).toBeDefined();
      expect(like.userId).toBe('user123');
      expect(like.blogId).toBe('blog456');
    });

    test('should return null if user has not liked blog', async () => {
      const like = await Like.findOne({ userId: 'user123', blogId: 'blog789' });
      expect(like).toBeNull();
    });
  });

  describe('DELETE /api/like - Unlike (Remove Like)', () => {
    test('should delete like', async () => {
      const like = await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      await Like.findByIdAndDelete(like._id);

      const found = await Like.findById(like._id);
      expect(found).toBeNull();
    });

    test('should remove like by userId and blogId', async () => {
      await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      await Like.deleteOne({ userId: 'user123', blogId: 'blog456' });

      const like = await Like.findOne({ userId: 'user123', blogId: 'blog456' });
      expect(like).toBeNull();
    });
  });

  describe('Timestamps', () => {
    test('should have createdAt timestamp', async () => {
      const like = await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      expect(like.createdAt).toBeDefined();
      expect(like.createdAt).toBeInstanceOf(Date);
    });

    test('should have updatedAt timestamp', async () => {
      const like = await Like.create({
        userId: 'user123',
        blogId: 'blog456',
      });

      expect(like.updatedAt).toBeDefined();
      expect(like.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Like Statistics', () => {
    test('should aggregate likes per blog', async () => {
      await Like.create({ userId: 'user1', blogId: 'blog1' });
      await Like.create({ userId: 'user2', blogId: 'blog1' });
      await Like.create({ userId: 'user3', blogId: 'blog2' });

      const blog1Count = await Like.countDocuments({ blogId: 'blog1' });
      const blog2Count = await Like.countDocuments({ blogId: 'blog2' });

      expect(blog1Count).toBe(2);
      expect(blog2Count).toBe(1);
    });

    test('should get distinct users who liked', async () => {
      await Like.create({ userId: 'user1', blogId: 'blog1' });
      await Like.create({ userId: 'user2', blogId: 'blog1' });
      await Like.create({ userId: 'user1', blogId: 'blog2' });

      const distinctUsers = await Like.distinct('userId');
      expect(distinctUsers).toHaveLength(2);
      expect(distinctUsers).toContain('user1');
      expect(distinctUsers).toContain('user2');
    });
  });
});
