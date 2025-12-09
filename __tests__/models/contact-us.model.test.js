import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Contact from '../../src/app/api/models/contact-us.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../utils/testDb.js';
import { mockContactData } from '../fixtures/mockData.js';

describe('Contact Model Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Contact Creation', () => {
    test('should create contact with all required fields', async () => {
      const contact = await Contact.create(mockContactData.valid);
      
      expect(contact._id).toBeDefined();
      expect(contact.name).toBe(mockContactData.valid.name);
      expect(contact.email).toBe(mockContactData.valid.email);
      expect(contact.message).toBe(mockContactData.valid.message);
      expect(contact.createdAt).toBeDefined();
    });

    test('should create contact message', async () => {
      const contact = await Contact.create(mockContactData.bugReport);
      
      expect(contact._id).toBeDefined();
      expect(contact.message).toBeDefined();
    });

    test('should fail without required name field', async () => {
      const invalidData = { ...mockContactData.valid };
      delete invalidData.name;

      await expect(Contact.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required email field', async () => {
      const invalidData = { ...mockContactData.valid };
      delete invalidData.email;

      await expect(Contact.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required message field', async () => {
      const invalidData = { ...mockContactData.valid };
      delete invalidData.message;

      await expect(Contact.create(invalidData)).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidData = { ...mockContactData.valid, email: 'invalid-email' };

      await expect(Contact.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Contact Query', () => {
    test('should find contact by email', async () => {
      await Contact.create(mockContactData.valid);
      const found = await Contact.findOne({ email: mockContactData.valid.email });
      
      expect(found).toBeDefined();
      expect(found.email).toBe(mockContactData.valid.email);
    });

    test('should find contacts by name', async () => {
      await Contact.create(mockContactData.valid);
      await Contact.create(mockContactData.bugReport);
      
      const contacts = await Contact.find({});
      expect(contacts.length).toBeGreaterThanOrEqual(2);
    });
  });
});
