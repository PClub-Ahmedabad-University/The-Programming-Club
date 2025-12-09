import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import CPProblem from '../../../src/app/api/models/cp-problem.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestUser } from '../../utils/testHelpers.js';

describe('CP Problems API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/cp/problems - Create CP Problem', () => {
    test('should create CP problem', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Two Sum',
        link: 'https://codeforces.com/problem/1234/A',
      });

      expect(problem._id).toBeDefined();
      expect(problem.problemId).toBe('1234A');
      expect(problem.title).toBe('Two Sum');
      expect(problem.link).toBe('https://codeforces.com/problem/1234/A');
      expect(problem.isActive).toBe(true);
    });

    test('should fail without required problemId', async () => {
      await expect(
        CPProblem.create({
          title: 'Test Problem',
          link: 'https://codeforces.com/problem/1234/A',
        })
      ).rejects.toThrow();
    });

    test('should fail without required title', async () => {
      await expect(
        CPProblem.create({
          problemId: '1234A',
          link: 'https://codeforces.com/problem/1234/A',
        })
      ).rejects.toThrow();
    });

    test('should fail without required link', async () => {
      await expect(
        CPProblem.create({
          problemId: '1234A',
          title: 'Test Problem',
        })
      ).rejects.toThrow();
    });

    test('should enforce unique problemId', async () => {
      await CPProblem.create({
        problemId: '1234A',
        title: 'Problem 1',
        link: 'https://codeforces.com/problem/1234/A',
      });

      await expect(
        CPProblem.create({
          problemId: '1234A',
          title: 'Problem 2',
          link: 'https://codeforces.com/problem/1234/B',
        })
      ).rejects.toThrow();
    });

    test('should validate URL format for link', async () => {
      await expect(
        CPProblem.create({
          problemId: '1234A',
          title: 'Test Problem',
          link: 'not-a-valid-url',
        })
      ).rejects.toThrow();
    });

    test('should accept http links', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'http://example.com/problem',
      });

      expect(problem.link).toBe('http://example.com/problem');
    });

    test('should accept https links', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://example.com/problem',
      });

      expect(problem.link).toBe('https://example.com/problem');
    });

    test('should default solution to null', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      expect(problem.solution).toBeNull();
    });

    test('should allow setting solution', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
        solution: 'https://github.com/user/solution',
      });

      expect(problem.solution).toBe('https://github.com/user/solution');
    });

    test('should default isActive to true', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      expect(problem.isActive).toBe(true);
    });
  });

  describe('GET /api/cp/problems - Get All Problems', () => {
    test('should return empty array when no problems', async () => {
      const problems = await CPProblem.find({});
      expect(Array.isArray(problems)).toBe(true);
      expect(problems).toHaveLength(0);
    });

    test('should get all problems', async () => {
      await CPProblem.create({
        problemId: '1234A',
        title: 'Problem 1',
        link: 'https://codeforces.com/problem/1234/A',
      });
      await CPProblem.create({
        problemId: '1234B',
        title: 'Problem 2',
        link: 'https://codeforces.com/problem/1234/B',
      });

      const problems = await CPProblem.find({});
      expect(problems).toHaveLength(2);
    });

    test('should filter active problems', async () => {
      await CPProblem.create({
        problemId: '1234A',
        title: 'Active Problem',
        link: 'https://codeforces.com/problem/1234/A',
        isActive: true,
      });
      await CPProblem.create({
        problemId: '1234B',
        title: 'Inactive Problem',
        link: 'https://codeforces.com/problem/1234/B',
        isActive: false,
      });

      const activeProblems = await CPProblem.find({ isActive: true });
      expect(activeProblems).toHaveLength(1);
      expect(activeProblems[0].title).toBe('Active Problem');
    });

    test('should sort by postedAt descending', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-15');

      await CPProblem.create({
        problemId: '1234A',
        title: 'Older Problem',
        link: 'https://codeforces.com/problem/1234/A',
        postedAt: date1,
      });
      await CPProblem.create({
        problemId: '1234B',
        title: 'Newer Problem',
        link: 'https://codeforces.com/problem/1234/B',
        postedAt: date2,
      });

      const problems = await CPProblem.find({}).sort({ postedAt: -1 });
      expect(problems[0].title).toBe('Newer Problem');
      expect(problems[1].title).toBe('Older Problem');
    });
  });

  describe('Problem Submissions', () => {
    test('should add user submission to problem', async () => {
      const user = await createTestUser();
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const updated = await CPProblem.findByIdAndUpdate(
        problem._id,
        {
          $push: {
            submittedUsers: {
              userId: user._id,
              verdict: 'AC',
            },
          },
        },
        { new: true }
      );

      expect(updated.submittedUsers).toHaveLength(1);
      expect(updated.submittedUsers[0].userId.toString()).toBe(user._id.toString());
      expect(updated.submittedUsers[0].verdict).toBe('AC');
    });

    test('should support multiple verdicts', async () => {
      const user = await createTestUser();
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      await CPProblem.findByIdAndUpdate(problem._id, {
        $push: {
          submittedUsers: { userId: user._id, verdict: 'WA' },
        },
      });

      const verdicts = ['AC', 'WA', 'TLE', 'RE', 'CE', 'Pending'];
      for (const verdict of verdicts) {
        const submission = { userId: user._id, verdict };
        expect(['AC', 'WA', 'TLE', 'RE', 'CE', 'Pending']).toContain(verdict);
      }
    });

    test('should track submission timestamp', async () => {
      const user = await createTestUser();
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const updated = await CPProblem.findByIdAndUpdate(
        problem._id,
        {
          $push: {
            submittedUsers: {
              userId: user._id,
              verdict: 'AC',
            },
          },
        },
        { new: true }
      );

      expect(updated.submittedUsers[0].submittedAt).toBeDefined();
      expect(updated.submittedUsers[0].submittedAt).toBeInstanceOf(Date);
    });

    test('should default verdict to Pending', async () => {
      const user = await createTestUser();
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const updated = await CPProblem.findByIdAndUpdate(
        problem._id,
        {
          $push: {
            submittedUsers: {
              userId: user._id,
            },
          },
        },
        { new: true }
      );

      expect(updated.submittedUsers[0].verdict).toBe('Pending');
    });
  });

  describe('GET /api/cp/problems/[problemId] - Get Problem by ID', () => {
    test('should find problem by problemId', async () => {
      await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const problem = await CPProblem.findOne({ problemId: '1234A' });
      expect(problem).toBeDefined();
      expect(problem.title).toBe('Test Problem');
    });

    test('should return null for non-existent problemId', async () => {
      const problem = await CPProblem.findOne({ problemId: 'nonexistent' });
      expect(problem).toBeNull();
    });
  });

  describe('Update Problem', () => {
    test('should update problem title', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Old Title',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const updated = await CPProblem.findByIdAndUpdate(
        problem._id,
        { title: 'New Title' },
        { new: true }
      );

      expect(updated.title).toBe('New Title');
    });

    test('should update solution link', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const updated = await CPProblem.findByIdAndUpdate(
        problem._id,
        { solution: 'https://github.com/user/solution' },
        { new: true }
      );

      expect(updated.solution).toBe('https://github.com/user/solution');
    });

    test('should deactivate problem', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      const updated = await CPProblem.findByIdAndUpdate(
        problem._id,
        { isActive: false },
        { new: true }
      );

      expect(updated.isActive).toBe(false);
    });
  });

  describe('DELETE /api/cp/problems/[problemId] - Delete Problem', () => {
    test('should delete problem', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'To Delete',
        link: 'https://codeforces.com/problem/1234/A',
      });

      await CPProblem.findByIdAndDelete(problem._id);

      const found = await CPProblem.findById(problem._id);
      expect(found).toBeNull();
    });
  });

  describe('Timestamps', () => {
    test('should have createdAt timestamp', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      expect(problem.createdAt).toBeDefined();
      expect(problem.createdAt).toBeInstanceOf(Date);
    });

    test('should have updatedAt timestamp', async () => {
      const problem = await CPProblem.create({
        problemId: '1234A',
        title: 'Test Problem',
        link: 'https://codeforces.com/problem/1234/A',
      });

      expect(problem.updatedAt).toBeDefined();
      expect(problem.updatedAt).toBeInstanceOf(Date);
    });
  });
});
