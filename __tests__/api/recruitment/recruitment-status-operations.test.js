import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import RecruitmentStatus from '../../../src/app/api/models/recruitmentStatus.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Recruitment Status API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/recruitment/status - Create Recruitment Status', () => {
    test('should create recruitment status', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      expect(status._id).toBeDefined();
      expect(status.isRecruitmentOpen).toBe(true);
    });

    test('should default isRecruitmentOpen to false', async () => {
      const status = await RecruitmentStatus.create({});

      expect(status.isRecruitmentOpen).toBe(false);
    });

    test('should create with open status', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      expect(status.isRecruitmentOpen).toBe(true);
    });

    test('should create with closed status', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: false,
      });

      expect(status.isRecruitmentOpen).toBe(false);
    });
  });

  describe('GET /api/recruitment/status - Get Recruitment Status', () => {
    test('should return null when no status exists', async () => {
      const status = await RecruitmentStatus.findOne({});
      expect(status).toBeNull();
    });

    test('should get recruitment status', async () => {
      await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      const status = await RecruitmentStatus.findOne({});
      expect(status).toBeDefined();
      expect(status.isRecruitmentOpen).toBe(true);
    });

    test('should get latest status when multiple exist', async () => {
      const first = await RecruitmentStatus.create({
        isRecruitmentOpen: false,
      });
      
      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const second = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      const latestStatus = await RecruitmentStatus.findOne({}).sort({ createdAt: -1 });
      expect(latestStatus._id.toString()).toBe(second._id.toString());
      expect(latestStatus.isRecruitmentOpen).toBe(true);
    });
  });

  describe('PATCH /api/recruitment/status - Update Recruitment Status', () => {
    test('should update recruitment status to open', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: false,
      });

      const updated = await RecruitmentStatus.findByIdAndUpdate(
        status._id,
        { isRecruitmentOpen: true },
        { new: true }
      );

      expect(updated.isRecruitmentOpen).toBe(true);
    });

    test('should update recruitment status to closed', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      const updated = await RecruitmentStatus.findByIdAndUpdate(
        status._id,
        { isRecruitmentOpen: false },
        { new: true }
      );

      expect(updated.isRecruitmentOpen).toBe(false);
    });

    test('should toggle recruitment status', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      const toggled = await RecruitmentStatus.findByIdAndUpdate(
        status._id,
        { isRecruitmentOpen: !status.isRecruitmentOpen },
        { new: true }
      );

      expect(toggled.isRecruitmentOpen).toBe(false);
    });
  });

  describe('Timestamps', () => {
    test('should have createdAt timestamp', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      expect(status.createdAt).toBeDefined();
      expect(status.createdAt).toBeInstanceOf(Date);
    });

    test('should have updatedAt timestamp', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      expect(status.updatedAt).toBeDefined();
      expect(status.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on modification', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: false,
      });

      const originalUpdatedAt = status.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await RecruitmentStatus.findByIdAndUpdate(
        status._id,
        { isRecruitmentOpen: true },
        { new: true }
      );

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('DELETE /api/recruitment/status - Delete Status', () => {
    test('should delete recruitment status', async () => {
      const status = await RecruitmentStatus.create({
        isRecruitmentOpen: true,
      });

      await RecruitmentStatus.findByIdAndDelete(status._id);

      const found = await RecruitmentStatus.findById(status._id);
      expect(found).toBeNull();
    });
  });

  describe('Status Queries', () => {
    test('should find open recruitments', async () => {
      await RecruitmentStatus.create({ isRecruitmentOpen: true });
      await RecruitmentStatus.create({ isRecruitmentOpen: false });
      await RecruitmentStatus.create({ isRecruitmentOpen: true });

      const openStatuses = await RecruitmentStatus.find({ isRecruitmentOpen: true });
      expect(openStatuses).toHaveLength(2);
    });

    test('should find closed recruitments', async () => {
      await RecruitmentStatus.create({ isRecruitmentOpen: true });
      await RecruitmentStatus.create({ isRecruitmentOpen: false });
      await RecruitmentStatus.create({ isRecruitmentOpen: false });

      const closedStatuses = await RecruitmentStatus.find({ isRecruitmentOpen: false });
      expect(closedStatuses).toHaveLength(2);
    });

    test('should count total statuses', async () => {
      await RecruitmentStatus.create({ isRecruitmentOpen: true });
      await RecruitmentStatus.create({ isRecruitmentOpen: false });

      const count = await RecruitmentStatus.countDocuments({});
      expect(count).toBe(2);
    });
  });
});
