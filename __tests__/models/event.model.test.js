import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Event from '../../src/app/api/models/event.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../utils/testDb.js';
import { mockEventData } from '../fixtures/mockData.js';

describe('Event Model Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Event Creation', () => {
    test('should create event with all required fields', async () => {
      const event = await Event.create(mockEventData.valid);
      
      expect(event._id).toBeDefined();
      expect(event.title).toBe(mockEventData.valid.title);
      expect(event.location).toBe(mockEventData.valid.location);
      expect(event.type).toBe(mockEventData.valid.type);
      expect(event.status).toBe(mockEventData.valid.status);
      expect(event.registrationOpen).toBe(true);
      expect(event.more_details).toBe(mockEventData.valid.more_details);
    });

    test('should fail without required title field', async () => {
      const invalidData = { ...mockEventData.valid };
      delete invalidData.title;

      await expect(Event.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required location field', async () => {
      const invalidData = { ...mockEventData.valid };
      delete invalidData.location;

      await expect(Event.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required type field', async () => {
      const invalidData = { ...mockEventData.valid };
      delete invalidData.type;

      await expect(Event.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required status field', async () => {
      const invalidData = { ...mockEventData.valid };
      delete invalidData.status;

      await expect(Event.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required registrationOpen field', async () => {
      const invalidData = { ...mockEventData.valid };
      delete invalidData.registrationOpen;

      await expect(Event.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required more_details field', async () => {
      const invalidData = { ...mockEventData.valid };
      delete invalidData.more_details;

      await expect(Event.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Event Type Enum', () => {
    test('should accept valid type: CP', async () => {
      const event = await Event.create({ ...mockEventData.valid, type: 'CP' });
      expect(event.type).toBe('CP');
    });

    test('should accept valid type: DEV', async () => {
      const event = await Event.create({ ...mockEventData.valid, type: 'DEV' });
      expect(event.type).toBe('DEV');
    });

    test('should accept valid type: FUN', async () => {
      const event = await Event.create({ ...mockEventData.valid, type: 'FUN' });
      expect(event.type).toBe('FUN');
    });
  });

  describe('Event Status Enum', () => {
    test('should accept valid status: Upcoming', async () => {
      const event = await Event.create({ ...mockEventData.valid, status: 'Upcoming' });
      expect(event.status).toBe('Upcoming');
    });

    test('should accept valid status: Completed', async () => {
      const event = await Event.create({ ...mockEventData.valid, status: 'Completed' });
      expect(event.status).toBe('Completed');
    });

    test('should accept valid status: On Going', async () => {
      const event = await Event.create({ ...mockEventData.valid, status: 'On Going' });
      expect(event.status).toBe('On Going');
    });
  });

  describe('Event Query', () => {
    test('should find event by title', async () => {
      await Event.create(mockEventData.valid);
      const found = await Event.findOne({ title: mockEventData.valid.title });
      
      expect(found).toBeDefined();
      expect(found.title).toBe(mockEventData.valid.title);
    });

    test('should find upcoming events by status', async () => {
      await Event.create(mockEventData.valid);
      await Event.create(mockEventData.pastEvent);
      
      const upcoming = await Event.find({ status: 'Upcoming' });
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].status).toBe('Upcoming');
    });
  });
});
