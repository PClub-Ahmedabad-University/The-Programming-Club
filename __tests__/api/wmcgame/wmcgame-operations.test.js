import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import WMCUser from '../../../src/app/api/models/wmcgameuser.model.js';
import WMCAudience from '../../../src/app/api/models/wmcgameaudience.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('WMC Game API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('WMC User Operations', () => {
    describe('POST /api/wmcgame/innit - Create WMC User', () => {
      test('should create WMC user', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        expect(user._id).toBeDefined();
        expect(user.enrollmentNumber).toBe('ENR001');
        expect(user.treasure).toBe('gold');
        expect(user.role).toBe('student');
      });

      test('should fail without required enrollmentNumber', async () => {
        await expect(
          WMCUser.create({
            treasure: 'gold',
            role: 'student',
          })
        ).rejects.toThrow();
      });

      test('should fail without required treasure', async () => {
        await expect(
          WMCUser.create({
            enrollmentNumber: 'ENR001',
            role: 'student',
          })
        ).rejects.toThrow();
      });

      test('should fail without required role', async () => {
        await expect(
          WMCUser.create({
            enrollmentNumber: 'ENR001',
            treasure: 'gold',
          })
        ).rejects.toThrow();
      });

      test('should enforce unique enrollmentNumber', async () => {
        await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        await expect(
          WMCUser.create({
            enrollmentNumber: 'ENR001',
            treasure: 'silver',
            role: 'student',
          })
        ).rejects.toThrow();
      });

      test('should trim enrollmentNumber', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: '  ENR001  ',
          treasure: 'gold',
          role: 'student',
        });

        expect(user.enrollmentNumber).toBe('ENR001');
      });

      test('should default qrCode to null', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        expect(user.qrCode).toBeNull();
      });

      test('should default assignedAudience to empty array', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        expect(Array.isArray(user.assignedAudience)).toBe(true);
        expect(user.assignedAudience).toHaveLength(0);
      });
    });

    describe('GET /api/wmcgame - Get WMC Users', () => {
      test('should return empty array when no users', async () => {
        const users = await WMCUser.find({});
        expect(Array.isArray(users)).toBe(true);
        expect(users).toHaveLength(0);
      });

      test('should get all WMC users', async () => {
        await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });
        await WMCUser.create({
          enrollmentNumber: 'ENR002',
          treasure: 'silver',
          role: 'admin',
        });

        const users = await WMCUser.find({});
        expect(users).toHaveLength(2);
      });

      test('should filter by role', async () => {
        await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });
        await WMCUser.create({
          enrollmentNumber: 'ENR002',
          treasure: 'silver',
          role: 'admin',
        });

        const students = await WMCUser.find({ role: 'student' });
        expect(students).toHaveLength(1);
        expect(students[0].role).toBe('student');
      });

      test('should filter by treasure', async () => {
        await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });
        await WMCUser.create({
          enrollmentNumber: 'ENR002',
          treasure: 'gold',
          role: 'admin',
        });

        const goldUsers = await WMCUser.find({ treasure: 'gold' });
        expect(goldUsers).toHaveLength(2);
      });
    });

    describe('PATCH /api/wmcgame - Update WMC User', () => {
      test('should assign QR code to user', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        const updated = await WMCUser.findByIdAndUpdate(
          user._id,
          { qrCode: 'QR123456' },
          { new: true }
        );

        expect(updated.qrCode).toBe('QR123456');
      });

      test('should assign audience to user', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        const updated = await WMCUser.findByIdAndUpdate(
          user._id,
          { assignedAudience: ['AUD001'] },
          { new: true }
        );

        expect(Array.isArray(updated.assignedAudience)).toBe(true);
        expect(updated.assignedAudience[0]).toContain('AUD001');
      });
    });
  });

  describe('WMC Audience Operations', () => {
    describe('POST /api/audience - Create WMC Audience', () => {
      test('should create WMC audience', async () => {
        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        expect(audience._id).toBeDefined();
        expect(audience.enrollmentNumber).toBe('AUD001');
        expect(audience.role).toBe('audience');
        expect(audience.treasure).toBe('bronze');
      });

      test('should fail without required enrollmentNumber', async () => {
        await expect(
          WMCAudience.create({
            role: 'audience',
            treasure: 'bronze',
          })
        ).rejects.toThrow();
      });

      test('should fail without required role', async () => {
        await expect(
          WMCAudience.create({
            enrollmentNumber: 'AUD001',
            treasure: 'bronze',
          })
        ).rejects.toThrow();
      });

      test('should fail without required treasure', async () => {
        await expect(
          WMCAudience.create({
            enrollmentNumber: 'AUD001',
            role: 'audience',
          })
        ).rejects.toThrow();
      });

      test('should enforce unique enrollmentNumber', async () => {
        await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        await expect(
          WMCAudience.create({
            enrollmentNumber: 'AUD001',
            role: 'audience',
            treasure: 'silver',
          })
        ).rejects.toThrow();
      });

      test('should default pairedWith to null', async () => {
        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        expect(audience.pairedWith).toBeNull();
      });

      test('should default qrCode to null', async () => {
        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        expect(audience.qrCode).toBeNull();
      });

      test('should default retrys to 3', async () => {
        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        expect(audience.retrys).toBe(3);
      });
    });

    describe('GET /api/audience/get - Get WMC Audience', () => {
      test('should return empty array when no audience', async () => {
        const audiences = await WMCAudience.find({});
        expect(Array.isArray(audiences)).toBe(true);
        expect(audiences).toHaveLength(0);
      });

      test('should get all audience members', async () => {
        await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });
        await WMCAudience.create({
          enrollmentNumber: 'AUD002',
          role: 'audience',
          treasure: 'silver',
        });

        const audiences = await WMCAudience.find({});
        expect(audiences).toHaveLength(2);
      });
    });

    describe('POST /api/wmcgame/pair - Pair Audience with User', () => {
      test('should pair audience with user', async () => {
        const user = await WMCUser.create({
          enrollmentNumber: 'ENR001',
          treasure: 'gold',
          role: 'student',
        });

        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        const updated = await WMCAudience.findByIdAndUpdate(
          audience._id,
          { pairedWith: user._id },
          { new: true }
        );

        expect(updated.pairedWith.toString()).toBe(user._id.toString());
      });
    });

    describe('Audience QR and Retries', () => {
      test('should assign QR code to audience', async () => {
        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        const updated = await WMCAudience.findByIdAndUpdate(
          audience._id,
          { qrCode: 'QR_AUD001' },
          { new: true }
        );

        expect(updated.qrCode).toBe('QR_AUD001');
      });

      test('should decrement retries', async () => {
        const audience = await WMCAudience.create({
          enrollmentNumber: 'AUD001',
          role: 'audience',
          treasure: 'bronze',
        });

        const updated = await WMCAudience.findByIdAndUpdate(
          audience._id,
          { $inc: { retrys: -1 } },
          { new: true }
        );

        expect(updated.retrys).toBe(2);
      });
    });
  });

  describe('Timestamps', () => {
    test('should have timestamps for WMC user', async () => {
      const user = await WMCUser.create({
        enrollmentNumber: 'ENR001',
        treasure: 'gold',
        role: 'student',
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should have timestamps for audience', async () => {
      const audience = await WMCAudience.create({
        enrollmentNumber: 'AUD001',
        role: 'audience',
        treasure: 'bronze',
      });

      expect(audience.createdAt).toBeDefined();
      expect(audience.updatedAt).toBeDefined();
    });
  });
});
