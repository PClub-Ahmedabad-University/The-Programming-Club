import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Trigger from '../../../src/app/api/models/trigger.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Triggers API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/triggers - Create Trigger', () => {
    test('should create trigger with sheet and webhook URLs', async () => {
      const trigger = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl: 'https://example.com/api/hook',
      });

      expect(trigger._id).toBeDefined();
      expect(trigger.sheetUrl).toBe('https://docs.google.com/spreadsheets/d/abc123/edit');
      expect(trigger.webhookUrl).toBe('https://example.com/api/hook');
    });

    test('should fail without required sheetUrl', async () => {
      await expect(
        Trigger.create({
          webhookUrl: 'https://example.com/api/hook',
        })
      ).rejects.toThrow();
    });

    test('should fail without required webhookUrl', async () => {
      await expect(
        Trigger.create({
          sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        })
      ).rejects.toThrow();
    });

    test('should auto-set createdAt timestamp', async () => {
      const trigger = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl: 'https://example.com/api/hook',
      });

      expect(trigger.createdAt).toBeDefined();
      expect(trigger.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/triggers - Get All Triggers', () => {
    test('should return empty array when no triggers', async () => {
      const triggers = await Trigger.find({});
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers).toHaveLength(0);
    });

    test('should get all triggers', async () => {
      await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl: 'https://example.com/api/hook',
      });
      await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/xyz789/edit',
        webhookUrl: 'https://example.com/api/hook2',
      });

      const triggers = await Trigger.find({});
      expect(triggers).toHaveLength(2);
    });

    test('should find trigger by sheetUrl', async () => {
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/unique123/edit';
      await Trigger.create({
        sheetUrl,
        webhookUrl: 'https://example.com/api/hook',
      });

      const trigger = await Trigger.findOne({ sheetUrl });
      expect(trigger).toBeDefined();
      expect(trigger.sheetUrl).toBe(sheetUrl);
    });

    test('should find trigger by webhookUrl', async () => {
      const webhookUrl = 'https://example.com/api/unique-hook';
      await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl,
      });

      const trigger = await Trigger.findOne({ webhookUrl });
      expect(trigger).toBeDefined();
      expect(trigger.webhookUrl).toBe(webhookUrl);
    });
  });

  describe('Update Trigger', () => {
    test('should update sheetUrl', async () => {
      const trigger = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/old123/edit',
        webhookUrl: 'https://example.com/api/hook',
      });

      const updated = await Trigger.findByIdAndUpdate(
        trigger._id,
        { sheetUrl: 'https://docs.google.com/spreadsheets/d/new456/edit' },
        { new: true }
      );

      expect(updated.sheetUrl).toBe('https://docs.google.com/spreadsheets/d/new456/edit');
    });

    test('should update webhookUrl', async () => {
      const trigger = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl: 'https://example.com/api/old-hook',
      });

      const updated = await Trigger.findByIdAndUpdate(
        trigger._id,
        { webhookUrl: 'https://example.com/api/new-hook' },
        { new: true }
      );

      expect(updated.webhookUrl).toBe('https://example.com/api/new-hook');
    });
  });

  describe('DELETE /api/triggers/[triggerId] - Delete Trigger', () => {
    test('should delete trigger', async () => {
      const trigger = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl: 'https://example.com/api/hook',
      });

      await Trigger.findByIdAndDelete(trigger._id);

      const found = await Trigger.findById(trigger._id);
      expect(found).toBeNull();
    });
  });

  describe('Trigger Queries', () => {
    test('should count total triggers', async () => {
      await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
        webhookUrl: 'https://example.com/api/hook1',
      });
      await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/xyz789/edit',
        webhookUrl: 'https://example.com/api/hook2',
      });

      const count = await Trigger.countDocuments({});
      expect(count).toBe(2);
    });

    test('should sort triggers by createdAt', async () => {
      const trigger1 = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/first/edit',
        webhookUrl: 'https://example.com/api/hook1',
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const trigger2 = await Trigger.create({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/second/edit',
        webhookUrl: 'https://example.com/api/hook2',
      });

      const triggers = await Trigger.find({}).sort({ createdAt: -1 });
      expect(triggers[0]._id.toString()).toBe(trigger2._id.toString());
      expect(triggers[1]._id.toString()).toBe(trigger1._id.toString());
    });
  });
});
