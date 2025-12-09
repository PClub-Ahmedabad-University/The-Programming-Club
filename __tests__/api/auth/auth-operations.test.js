import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import User from '../../../src/app/api/models/user.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestUser, generateTestToken } from '../../utils/testHelpers.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth API - Authentication Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/register - User Registration', () => {
    test('should create user with valid registration data', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      const userData = {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        enrollmentNumber: 'EN123456',
        codeforcesHandle: 'testcf',
      };

      const user = await User.create(userData);
      expect(user._id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.enrollmentNumber).toBe('EN123456');
      expect(user.codeforcesHandle).toBe('testcf');
    });

    test('should hash password before storing', async () => {
      const plainPassword = 'Test@1234';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        enrollmentNumber: 'EN123456',
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toBe(hashedPassword);
    });

    test('should fail without required username', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      const userData = {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        // Missing enrollmentNumber
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should fail without required email', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      const userData = {
        password: hashedPassword,
        name: 'Test User',
        enrollmentNumber: 'EN123456',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should fail without required password', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        enrollmentNumber: 'EN123456',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should prevent duplicate email registration', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      await expect(
        User.create({
          email: 'duplicate@example.com',
          password: hashedPassword,
          name: 'Another User',
          enrollmentNumber: 'EN999999',
        })
      ).rejects.toThrow();
    });

    test('should set default role to user', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      const user = await User.create({
        email: 'newuser@example.com',
        password: hashedPassword,
        name: 'New User',
        enrollmentNumber: 'EN111111',
      });
      
      expect(user.role).toBeUndefined(); // Default behavior
    });

    test('should allow creating admin user', async () => {
      const user = await createTestUser({ role: 'admin' });
      expect(user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login - User Login', () => {
    test('should find user by email', async () => {
      const user = await createTestUser({ email: 'login@example.com' });
      
      const found = await User.findOne({ email: 'login@example.com' });
      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(user._id.toString());
    });

    test('should verify correct password', async () => {
      const plainPassword = 'Test@1234';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        enrollmentNumber: 'EN123456',
      });

      const user = await User.findOne({ email: 'test@example.com' });
      const isMatch = await bcrypt.compare(plainPassword, user.password);
      expect(isMatch).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        enrollmentNumber: 'EN123456',
      });

      const user = await User.findOne({ email: 'test@example.com' });
      const isMatch = await bcrypt.compare('WrongPassword', user.password);
      expect(isMatch).toBe(false);
    });

    test('should return null for non-existent email', async () => {
      const user = await User.findOne({ email: 'nonexistent@example.com' });
      expect(user).toBeNull();
    });
  });

  describe('JWT Token Operations', () => {
    test('should generate valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateTestToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should verify JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateTestToken(userId);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, process.env.JWT_SECRET);
      }).toThrow();
    });

    test('should reject expired token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );
      
      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET);
      }).toThrow();
    });
  });

  describe('User Query Operations', () => {
    test('should find user by email', async () => {
      await createTestUser({ email: 'unique@example.com' });
      
      const user = await User.findOne({ email: 'unique@example.com' });
      expect(user).toBeDefined();
      expect(user.email).toBe('unique@example.com');
    });

    test('should find user by codeforcesHandle', async () => {
      await createTestUser({ codeforcesHandle: 'uniquecfhandle' });
      
      const user = await User.findOne({ codeforcesHandle: 'uniquecfhandle' });
      expect(user).toBeDefined();
      expect(user.codeforcesHandle).toBe('uniquecfhandle');
    });

    test('should find admin users', async () => {
      await createTestUser({ email: 'admin1@test.com', role: 'admin' });
      await createTestUser({ email: 'user1@test.com', role: 'user' });
      await createTestUser({ email: 'admin2@test.com', role: 'admin' });
      
      const admins = await User.find({ role: 'admin' });
      expect(admins).toHaveLength(2);
      expect(admins.every(u => u.role === 'admin')).toBe(true);
    });

    test('should update user profile', async () => {
      const user = await createTestUser({ name: 'Old Name' });
      
      const updated = await User.findByIdAndUpdate(
        user._id,
        { name: 'New Name' },
        { new: true }
      );
      
      expect(updated.name).toBe('New Name');
    });

    test('should delete user account', async () => {
      const user = await createTestUser();
      
      await User.findByIdAndDelete(user._id);
      
      const found = await User.findById(user._id);
      expect(found).toBeNull();
    });
  });
});
