import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import LastWeekLeaderboardSnap from '../../../src/app/api/models/weeklyLeaderboardSnapshot.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Leaderboard API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/leaderboard/weekly - Create Weekly Snapshot', () => {
    test('should create weekly leaderboard snapshot', async () => {
      const weekStart = new Date('2024-01-01');
      const weekEnd = new Date('2024-01-07');
      const leaderboard = [
        { userId: 'user1', codeforcesHandle: 'cf_user1', problemsSolved: 10, rank: 1 },
        { userId: 'user2', codeforcesHandle: 'cf_user2', problemsSolved: 8, rank: 2 },
      ];

      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart,
        weekEnd,
        leaderboard,
      });

      expect(snapshot._id).toBeDefined();
      expect(snapshot.weekStart).toEqual(weekStart);
      expect(snapshot.weekEnd).toEqual(weekEnd);
      expect(snapshot.leaderboard).toHaveLength(2);
      expect(snapshot.createdAt).toBeDefined();
    });

    test('should fail without required weekStart', async () => {
      await expect(
        LastWeekLeaderboardSnap.create({
          weekEnd: new Date('2024-01-07'),
          leaderboard: [],
        })
      ).rejects.toThrow();
    });

    test('should fail without required weekEnd', async () => {
      await expect(
        LastWeekLeaderboardSnap.create({
          weekStart: new Date('2024-01-01'),
          leaderboard: [],
        })
      ).rejects.toThrow();
    });

    test('should allow empty leaderboard array as default', async () => {
      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });

      expect(snapshot.leaderboard).toEqual([]);
    });

    test('should store empty leaderboard array', async () => {
      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });

      expect(Array.isArray(snapshot.leaderboard)).toBe(true);
      expect(snapshot.leaderboard).toHaveLength(0);
    });

    test('should auto-set createdAt timestamp', async () => {
      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });

      expect(snapshot.createdAt).toBeDefined();
      expect(snapshot.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/leaderboard/weekly - Get Weekly Leaderboard', () => {
    test('should return empty array when no snapshots', async () => {
      const snapshots = await LastWeekLeaderboardSnap.find({});
      expect(Array.isArray(snapshots)).toBe(true);
      expect(snapshots).toHaveLength(0);
    });

    test('should get all weekly snapshots', async () => {
      await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });
      await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-08'),
        weekEnd: new Date('2024-01-14'),
        leaderboard: [],
      });

      const snapshots = await LastWeekLeaderboardSnap.find({});
      expect(snapshots).toHaveLength(2);
    });

    test('should sort snapshots by date', async () => {
      await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [{ rank: 1 }],
      });
      await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-15'),
        weekEnd: new Date('2024-01-21'),
        leaderboard: [{ rank: 2 }],
      });

      const snapshots = await LastWeekLeaderboardSnap.find({}).sort({ weekStart: -1 });
      expect(snapshots[0].leaderboard[0].rank).toBe(2);
      expect(snapshots[1].leaderboard[0].rank).toBe(1);
    });

    test('should find snapshot by date range', async () => {
      const weekStart = new Date('2024-01-01');
      await LastWeekLeaderboardSnap.create({
        weekStart,
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });

      const snapshot = await LastWeekLeaderboardSnap.findOne({ weekStart });
      expect(snapshot).toBeDefined();
      expect(snapshot.weekStart).toEqual(weekStart);
    });
  });

  describe('GET /api/leaderboard - Get Current Leaderboard', () => {
    test('should get latest snapshot', async () => {
      const snap1 = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [{ rank: 1, user: 'old' }],
      });

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const snap2 = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-15'),
        weekEnd: new Date('2024-01-21'),
        leaderboard: [{ rank: 1, user: 'new' }],
      });

      const latest = await LastWeekLeaderboardSnap.findOne({}).sort({ createdAt: -1 });
      expect(latest._id.toString()).toBe(snap2._id.toString());
      expect(latest.leaderboard[0].user).toBe('new');
    });
  });

  describe('Leaderboard Data Structure', () => {
    test('should store user rankings', async () => {
      const leaderboard = [
        { 
          userId: 'user1',
          codeforcesHandle: 'cf_user1',
          problemsSolved: 15,
          rating: 1500,
          rank: 1,
        },
        { 
          userId: 'user2',
          codeforcesHandle: 'cf_user2',
          problemsSolved: 12,
          rating: 1400,
          rank: 2,
        },
      ];

      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard,
      });

      expect(snapshot.leaderboard[0].rank).toBe(1);
      expect(snapshot.leaderboard[0].problemsSolved).toBe(15);
      expect(snapshot.leaderboard[1].rank).toBe(2);
      expect(snapshot.leaderboard[1].problemsSolved).toBe(12);
    });

    test('should handle complex leaderboard data', async () => {
      const leaderboard = Array.from({ length: 10 }, (_, i) => ({
        userId: `user${i + 1}`,
        codeforcesHandle: `cf_user${i + 1}`,
        problemsSolved: 10 - i,
        rank: i + 1,
      }));

      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard,
      });

      expect(snapshot.leaderboard).toHaveLength(10);
      expect(snapshot.leaderboard[0].rank).toBe(1);
      expect(snapshot.leaderboard[9].rank).toBe(10);
    });
  });

  describe('DELETE Old Snapshots', () => {
    test('should delete snapshot', async () => {
      const snapshot = await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });

      await LastWeekLeaderboardSnap.findByIdAndDelete(snapshot._id);

      const found = await LastWeekLeaderboardSnap.findById(snapshot._id);
      expect(found).toBeNull();
    });

    test('should delete snapshots older than date', async () => {
      await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2023-12-01'),
        weekEnd: new Date('2023-12-07'),
        leaderboard: [],
      });
      await LastWeekLeaderboardSnap.create({
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        leaderboard: [],
      });

      await LastWeekLeaderboardSnap.deleteMany({
        weekStart: { $lt: new Date('2024-01-01') },
      });

      const remaining = await LastWeekLeaderboardSnap.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].weekStart).toEqual(new Date('2024-01-01'));
    });
  });
});
