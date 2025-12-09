import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import ProblemSolve from '../../../src/app/api/models/problemSolve.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestUser } from '../../utils/testHelpers.js';

describe('Problem Solve API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/problem-solve - Record Solved Problem', () => {
    test('should create problem solve record', async () => {
      const user = await createTestUser();
      
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });

      expect(solve._id).toBeDefined();
      expect(solve.userId.toString()).toBe(user._id.toString());
      expect(solve.codeforcesHandle).toBe('testuser');
      expect(solve.problemId).toBe('1234A');
      expect(solve.verdict).toBe('OK');
    });

    test('should fail without required userId', async () => {
      await expect(
        ProblemSolve.create({
          codeforcesHandle: 'testuser',
          problemId: '1234A',
          solvedAt: new Date(),
          submissionId: '123456789',
          verdict: 'OK',
        })
      ).rejects.toThrow();
    });

    test('should fail without required codeforcesHandle', async () => {
      await expect(
        ProblemSolve.create({
          userId: '507f1f77bcf86cd799439011',
          problemId: '1234A',
          solvedAt: new Date(),
          submissionId: '123456789',
          verdict: 'OK',
        })
      ).rejects.toThrow();
    });

    test('should fail without required problemId', async () => {
      await expect(
        ProblemSolve.create({
          userId: '507f1f77bcf86cd799439011',
          codeforcesHandle: 'testuser',
          solvedAt: new Date(),
          submissionId: '123456789',
          verdict: 'OK',
        })
      ).rejects.toThrow();
    });

    test('should enforce unique submissionId', async () => {
      const user = await createTestUser();
      const submissionId = '123456789';

      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId,
        verdict: 'OK',
      });

      await expect(
        ProblemSolve.create({
          userId: user._id,
          codeforcesHandle: 'testuser',
          problemId: '1234B',
          solvedAt: new Date(),
          submissionId,
          verdict: 'OK',
        })
      ).rejects.toThrow();
    });
  });

  describe('Verdict Types', () => {
    test('should accept OK verdict', async () => {
      const user = await createTestUser();
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });

      expect(solve.verdict).toBe('OK');
    });

    test('should accept WRONG_ANSWER verdict', async () => {
      const user = await createTestUser();
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456790',
        verdict: 'WRONG_ANSWER',
      });

      expect(solve.verdict).toBe('WRONG_ANSWER');
    });

    test('should accept TIME_LIMIT_EXCEEDED verdict', async () => {
      const user = await createTestUser();
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456791',
        verdict: 'TIME_LIMIT_EXCEEDED',
      });

      expect(solve.verdict).toBe('TIME_LIMIT_EXCEEDED');
    });

    test('should accept RUNTIME_ERROR verdict', async () => {
      const user = await createTestUser();
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456792',
        verdict: 'RUNTIME_ERROR',
      });

      expect(solve.verdict).toBe('RUNTIME_ERROR');
    });

    test('should accept COMPILATION_ERROR verdict', async () => {
      const user = await createTestUser();
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456793',
        verdict: 'COMPILATION_ERROR',
      });

      expect(solve.verdict).toBe('COMPILATION_ERROR');
    });
  });

  describe('GET /api/problem-solve/get/[codeforcesHandle] - Get User Solves', () => {
    test('should return empty array when no solves', async () => {
      const solves = await ProblemSolve.find({ codeforcesHandle: 'unknown' });
      expect(Array.isArray(solves)).toBe(true);
      expect(solves).toHaveLength(0);
    });

    test('should get all solves by codeforces handle', async () => {
      const user = await createTestUser();
      
      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });
      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234B',
        solvedAt: new Date(),
        submissionId: '123456790',
        verdict: 'OK',
      });

      const solves = await ProblemSolve.find({ codeforcesHandle: 'testuser' });
      expect(solves).toHaveLength(2);
    });

    test('should filter solves by verdict', async () => {
      const user = await createTestUser();
      
      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });
      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234B',
        solvedAt: new Date(),
        submissionId: '123456790',
        verdict: 'WRONG_ANSWER',
      });

      const okSolves = await ProblemSolve.find({ codeforcesHandle: 'testuser', verdict: 'OK' });
      expect(okSolves).toHaveLength(1);
      expect(okSolves[0].verdict).toBe('OK');
    });
  });

  describe('GET /api/problem-solve/get-solved-by/[problemId] - Get Problem Solvers', () => {
    test('should get all users who solved a problem', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({
        name: 'User Two',
        email: 'user2@test.com',
        enrollmentNumber: 'ENR002',
      });

      await ProblemSolve.create({
        userId: user1._id,
        codeforcesHandle: 'user1',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });
      await ProblemSolve.create({
        userId: user2._id,
        codeforcesHandle: 'user2',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456790',
        verdict: 'OK',
      });

      const solves = await ProblemSolve.find({ problemId: '1234A' });
      expect(solves).toHaveLength(2);
    });

    test('should only return OK verdicts for problem', async () => {
      const user = await createTestUser();
      
      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });
      await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456790',
        verdict: 'WRONG_ANSWER',
      });

      const okSolves = await ProblemSolve.find({ problemId: '1234A', verdict: 'OK' });
      expect(okSolves).toHaveLength(1);
    });
  });

  describe('Timestamps', () => {
    test('should have createdAt timestamp', async () => {
      const user = await createTestUser();
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: new Date(),
        submissionId: '123456789',
        verdict: 'OK',
      });

      expect(solve.createdAt).toBeDefined();
      expect(solve.createdAt).toBeInstanceOf(Date);
    });

    test('should store solvedAt timestamp', async () => {
      const user = await createTestUser();
      const solvedDate = new Date('2024-01-15');
      
      const solve = await ProblemSolve.create({
        userId: user._id,
        codeforcesHandle: 'testuser',
        problemId: '1234A',
        solvedAt: solvedDate,
        submissionId: '123456789',
        verdict: 'OK',
      });

      expect(solve.solvedAt).toEqual(solvedDate);
    });
  });
});
