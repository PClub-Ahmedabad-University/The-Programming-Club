import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Notice from '../../../src/app/api/models/notice.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Notice API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/notice - Create Notice', () => {
    test('should create notice with all required fields', async () => {
      const noticeData = {
        link: 'https://example.com/notice',
        message: 'Important announcement about upcoming event',
        show: true,
      };

      const notice = await Notice.create(noticeData);
      expect(notice._id).toBeDefined();
      expect(notice.link).toBe('https://example.com/notice');
      expect(notice.message).toBe('Important announcement about upcoming event');
      expect(notice.show).toBe(true);
    });

    test('should fail without required link', async () => {
      const noticeData = {
        message: 'Test message',
      };

      await expect(Notice.create(noticeData)).rejects.toThrow();
    });

    test('should fail without required message', async () => {
      const noticeData = {
        link: 'https://example.com/test',
      };

      await expect(Notice.create(noticeData)).rejects.toThrow();
    });

    test('should default show to true', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/test',
        message: 'Test message',
      });

      expect(notice.show).toBe(true);
    });

    test('should allow setting show to false', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/test',
        message: 'Test message',
        show: false,
      });

      expect(notice.show).toBe(false);
    });

    test('should have timestamps', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/test',
        message: 'Test message',
      });

      expect(notice.createdAt).toBeDefined();
      expect(notice.updatedAt).toBeDefined();
      expect(notice.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/notice - Get Notices', () => {
    test('should return empty array when no notices exist', async () => {
      const notices = await Notice.find({});
      expect(Array.isArray(notices)).toBe(true);
      expect(notices).toHaveLength(0);
    });

    test('should return all notices', async () => {
      await Notice.create({
        link: 'https://example.com/notice1',
        message: 'Notice 1',
      });
      await Notice.create({
        link: 'https://example.com/notice2',
        message: 'Notice 2',
      });

      const notices = await Notice.find({});
      expect(notices).toHaveLength(2);
    });

    test('should filter visible notices', async () => {
      await Notice.create({
        link: 'https://example.com/visible',
        message: 'Visible notice',
        show: true,
      });
      await Notice.create({
        link: 'https://example.com/hidden',
        message: 'Hidden notice',
        show: false,
      });

      const visibleNotices = await Notice.find({ show: true });
      expect(visibleNotices).toHaveLength(1);
      expect(visibleNotices[0].message).toBe('Visible notice');
    });

    test('should sort notices by creation date', async () => {
      const notice1 = await Notice.create({
        link: 'https://example.com/1',
        message: 'First notice',
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const notice2 = await Notice.create({
        link: 'https://example.com/2',
        message: 'Second notice',
      });

      const notices = await Notice.find({}).sort({ createdAt: -1 });
      expect(notices[0].message).toBe('Second notice');
      expect(notices[1].message).toBe('First notice');
    });
  });

  describe('Update Notice', () => {
    test('should update notice message', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/test',
        message: 'Original message',
      });

      const updated = await Notice.findByIdAndUpdate(
        notice._id,
        { message: 'Updated message' },
        { new: true }
      );

      expect(updated.message).toBe('Updated message');
    });

    test('should toggle show status', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/test',
        message: 'Test message',
        show: true,
      });

      const updated = await Notice.findByIdAndUpdate(
        notice._id,
        { show: false },
        { new: true }
      );

      expect(updated.show).toBe(false);
    });

    test('should update link', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/old',
        message: 'Test message',
      });

      const updated = await Notice.findByIdAndUpdate(
        notice._id,
        { link: 'https://example.com/new' },
        { new: true }
      );

      expect(updated.link).toBe('https://example.com/new');
    });
  });

  describe('Delete Notice', () => {
    test('should delete notice', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/delete',
        message: 'To be deleted',
      });

      await Notice.findByIdAndDelete(notice._id);

      const found = await Notice.findById(notice._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent notice', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await Notice.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });

  describe('Notice Content Validation', () => {
    test('should handle long messages', async () => {
      const longMessage = 'A'.repeat(500);
      const notice = await Notice.create({
        link: 'https://example.com/long',
        message: longMessage,
      });

      expect(notice.message.length).toBe(500);
    });

    test('should handle special characters in message', async () => {
      const specialMessage = 'Notice with special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/';
      const notice = await Notice.create({
        link: 'https://example.com/special',
        message: specialMessage,
      });

      expect(notice.message).toBe(specialMessage);
    });

    test('should handle URLs with query parameters', async () => {
      const notice = await Notice.create({
        link: 'https://example.com/page?param1=value1&param2=value2',
        message: 'Test notice',
      });

      expect(notice.link).toBe('https://example.com/page?param1=value1&param2=value2');
    });
  });
});
