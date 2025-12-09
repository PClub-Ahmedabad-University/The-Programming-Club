import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import User from '../../../src/app/api/models/user.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestUser } from '../../utils/testHelpers.js';

describe('Users API - User Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/users/search - Search Users', () => {
    test('should find users by name', async () => {
      await createTestUser({ name: 'John Doe', email: 'john@test.com' });
      await createTestUser({ name: 'Jane Smith', email: 'jane@test.com' });

      const users = await User.find({ name: /john/i });
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('John Doe');
    });

    test('should find users by email', async () => {
      await createTestUser({ email: 'alice@example.com' });
      await createTestUser({ email: 'bob@example.com' });

      const users = await User.find({ email: /alice/i });
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('alice@example.com');
    });

    test('should find users by enrollment number', async () => {
      await createTestUser({ enrollmentNumber: 'EN12345' });
      await createTestUser({ enrollmentNumber: 'EN67890' });

      const users = await User.find({ enrollmentNumber: /123/i });
      expect(users).toHaveLength(1);
      expect(users[0].enrollmentNumber).toBe('EN12345');
    });

    test('should return empty array when no match found', async () => {
      await createTestUser({ name: 'John Doe' });

      const users = await User.find({ name: /xyz/i });
      expect(users).toHaveLength(0);
    });

    test('should return all users when no filter applied', async () => {
      await createTestUser({ email: 'user1@test.com' });
      await createTestUser({ email: 'user2@test.com' });
      await createTestUser({ email: 'user3@test.com' });

      const users = await User.find({});
      expect(users).toHaveLength(3);
    });

    test('should perform case-insensitive search', async () => {
      await createTestUser({ name: 'John Doe', email: 'john@test.com' });

      const users1 = await User.find({ name: /JOHN/i });
      const users2 = await User.find({ name: /john/i });
      const users3 = await User.find({ name: /JoHn/i });

      expect(users1).toHaveLength(1);
      expect(users2).toHaveLength(1);
      expect(users3).toHaveLength(1);
    });
  });

  describe('GET /api/users/me - Get Current User', () => {
    test('should find user by ID', async () => {
      const user = await createTestUser();

      const found = await User.findById(user._id);
      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(user._id.toString());
    });

    test('should return null for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const user = await User.findById(fakeId);
      expect(user).toBeNull();
    });

    test('should return user with all fields', async () => {
      const user = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        enrollmentNumber: 'EN123',
        role: 'user',
      });

      const found = await User.findById(user._id);
      expect(found.name).toBe('Test User');
      expect(found.email).toBe('test@example.com');
      expect(found.enrollmentNumber).toBe('EN123');
      expect(found.role).toBe('user');
    });
  });

  describe('PATCH /api/users/update-profile - Update User Profile', () => {
    test('should update user name', async () => {
      const user = await createTestUser({ name: 'Old Name' });

      const updated = await User.findByIdAndUpdate(
        user._id,
        { name: 'New Name' },
        { new: true }
      );

      expect(updated.name).toBe('New Name');
    });

    test('should update codeforces handle', async () => {
      const user = await createTestUser({ codeforcesHandle: 'oldhandle' });

      const updated = await User.findByIdAndUpdate(
        user._id,
        { codeforcesHandle: 'newhandle' },
        { new: true }
      );

      expect(updated.codeforcesHandle).toBe('newhandle');
    });

    test('should update codeforces rating', async () => {
      const user = await createTestUser({ codeforcesRating: 1200 });

      const updated = await User.findByIdAndUpdate(
        user._id,
        { codeforcesRating: 1500 },
        { new: true }
      );

      expect(updated.codeforcesRating).toBe(1500);
    });

    test('should update codeforces rank', async () => {
      const user = await createTestUser({ codeforcesRank: 'pupil' });

      const updated = await User.findByIdAndUpdate(
        user._id,
        { codeforcesRank: 'specialist' },
        { new: true }
      );

      expect(updated.codeforcesRank).toBe('specialist');
    });

    test('should update multiple fields at once', async () => {
      const user = await createTestUser({
        name: 'Old Name',
        codeforcesHandle: 'oldhandle',
      });

      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          name: 'New Name',
          codeforcesHandle: 'newhandle',
          codeforcesRating: 1600,
        },
        { new: true }
      );

      expect(updated.name).toBe('New Name');
      expect(updated.codeforcesHandle).toBe('newhandle');
      expect(updated.codeforcesRating).toBe(1600);
    });
  });

  describe('User Codeforces Profile', () => {
    test('should default codeforces rating to 0', async () => {
      const user = await createTestUser();
      expect(user.codeforcesRating).toBe(0);
    });

    test('should default codeforces rank to unrated', async () => {
      const user = await createTestUser();
      expect(user.codeforcesRank).toBe('unrated');
    });

    test('should allow null codeforces handle', async () => {
      const user = await createTestUser({ codeforcesHandle: null });
      expect(user.codeforcesHandle).toBeNull();
    });

    test('should find users by codeforces handle', async () => {
      await createTestUser({ codeforcesHandle: 'tourist' });
      await createTestUser({ codeforcesHandle: 'petr' });

      const user = await User.findOne({ codeforcesHandle: 'tourist' });
      expect(user).toBeDefined();
      expect(user.codeforcesHandle).toBe('tourist');
    });

    test('should filter users by rating range', async () => {
      await createTestUser({ codeforcesRating: 1000 });
      await createTestUser({ codeforcesRating: 1500 });
      await createTestUser({ codeforcesRating: 2000 });

      const users = await User.find({
        codeforcesRating: { $gte: 1400, $lte: 1600 }
      });

      expect(users).toHaveLength(1);
      expect(users[0].codeforcesRating).toBe(1500);
    });
  });

  describe('User Roles', () => {
    test('should find users by role', async () => {
      await createTestUser({ role: 'admin', email: 'admin1@test.com' });
      await createTestUser({ role: 'user', email: 'user1@test.com' });
      await createTestUser({ role: 'admin', email: 'admin2@test.com' });

      const admins = await User.find({ role: 'admin' });
      expect(admins).toHaveLength(2);
    });

    test('should update user role', async () => {
      const user = await createTestUser({ role: 'user' });

      const updated = await User.findByIdAndUpdate(
        user._id,
        { role: 'admin' },
        { new: true }
      );

      expect(updated.role).toBe('admin');
    });
  });

  describe('User Registered Events', () => {
    test('should have empty registered events by default', async () => {
      const user = await createTestUser();
      expect(user.registeredEvents).toBeDefined();
      expect(Array.isArray(user.registeredEvents)).toBe(true);
    });

    test('should add event to registered events', async () => {
      const user = await createTestUser();
      const eventId = '507f1f77bcf86cd799439011';

      const updated = await User.findByIdAndUpdate(
        user._id,
        { $push: { registeredEvents: eventId } },
        { new: true }
      );

      expect(updated.registeredEvents.map(id => id.toString())).toContain(eventId);
    });

    test('should remove event from registered events', async () => {
      const eventId = '507f1f77bcf86cd799439011';
      const user = await createTestUser();
      
      await User.findByIdAndUpdate(user._id, { $push: { registeredEvents: eventId } });
      
      const updated = await User.findByIdAndUpdate(
        user._id,
        { $pull: { registeredEvents: eventId } },
        { new: true }
      );

      expect(updated.registeredEvents).not.toContain(eventId);
    });
  });
});
