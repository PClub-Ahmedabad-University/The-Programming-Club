import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Event from '../../../src/app/api/models/event.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestEvent } from '../../utils/testHelpers.js';

describe('Events API - CRUD Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  test('should return empty array when no events exist', async () => {
    const events = await Event.find({});
    expect(Array.isArray(events)).toBe(true);
    expect(events).toHaveLength(0);
  });

  test('should return all events when events exist', async () => {
    await createTestEvent({ title: 'Event 1', location: 'Location 1' });
    await createTestEvent({ title: 'Event 2', location: 'Location 2' });

    const events = await Event.find({});
    expect(events).toHaveLength(2);
    expect(events[0].title).toBe('Event 1');
    expect(events[1].title).toBe('Event 2');
  });

  test('should return events with correct structure', async () => {
    await createTestEvent({
      title: 'Tech Quiz 2025',
      description: 'A quiz event',
      location: 'Hall A',
      type: 'CP',
      status: 'Upcoming',
    });

    const events = await Event.find({});
    expect(events[0]).toHaveProperty('_id');
    expect(events[0]).toHaveProperty('title');
    expect(events[0]).toHaveProperty('description');
    expect(events[0]).toHaveProperty('location');
    expect(events[0]).toHaveProperty('type');
    expect(events[0]).toHaveProperty('status');
    expect(events[0]).toHaveProperty('registrationOpen');
    expect(events[0]).toHaveProperty('more_details');
  });

  test('should find event by ID', async () => {
    const createdEvent = await createTestEvent({
      title: 'Test Event',
      location: 'Test Location',
    });

    const foundEvent = await Event.findById(createdEvent._id);
    expect(foundEvent).toBeDefined();
    expect(foundEvent.title).toBe('Test Event');
    expect(foundEvent._id.toString()).toBe(createdEvent._id.toString());
  });

  test('should return null for non-existent event ID', async () => {
    const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
    const event = await Event.findById(fakeId);
    expect(event).toBeNull();
  });

  test('should filter events by status', async () => {
    await createTestEvent({ title: 'Upcoming Event', status: 'Upcoming' });
    await createTestEvent({ title: 'Completed Event', status: 'Completed' });
    await createTestEvent({ title: 'Another Upcoming', status: 'Upcoming' });

    const upcomingEvents = await Event.find({ status: 'Upcoming' });
    expect(upcomingEvents).toHaveLength(2);
    expect(upcomingEvents.every(e => e.status === 'Upcoming')).toBe(true);
  });

  test('should filter events by type', async () => {
    await createTestEvent({ title: 'CP Event', type: 'CP' });
    await createTestEvent({ title: 'DEV Event', type: 'DEV' });
    await createTestEvent({ title: 'Another CP', type: 'CP' });

    const cpEvents = await Event.find({ type: 'CP' });
    expect(cpEvents).toHaveLength(2);
    expect(cpEvents.every(e => e.type === 'CP')).toBe(true);
  });

  test('should filter events by registration status', async () => {
    await createTestEvent({ title: 'Open Registration', registrationOpen: true });
    await createTestEvent({ title: 'Closed Registration', registrationOpen: false });

    const openEvents = await Event.find({ registrationOpen: true });
    expect(openEvents).toHaveLength(1);
    expect(openEvents[0].registrationOpen).toBe(true);
  });

  test('should sort events by date', async () => {
    await createTestEvent({ 
      title: 'Future Event', 
      date: new Date('2026-01-01') 
    });
    await createTestEvent({ 
      title: 'Past Event', 
      date: new Date('2024-01-01') 
    });
    await createTestEvent({ 
      title: 'Recent Event', 
      date: new Date('2025-06-01') 
    });

    const events = await Event.find({}).sort({ date: 1 }); // Ascending
    expect(events[0].title).toBe('Past Event');
    expect(events[1].title).toBe('Recent Event');
    expect(events[2].title).toBe('Future Event');
  });

  test('should update event successfully', async () => {
    const event = await createTestEvent({ title: 'Original Title' });
    
    const updated = await Event.findByIdAndUpdate(
      event._id,
      { title: 'Updated Title' },
      { new: true }
    );

    expect(updated.title).toBe('Updated Title');
  });

  test('should delete event successfully', async () => {
    const event = await createTestEvent({ title: 'To Be Deleted' });
    
    await Event.findByIdAndDelete(event._id);
    
    const found = await Event.findById(event._id);
    expect(found).toBeNull();
  });
});
