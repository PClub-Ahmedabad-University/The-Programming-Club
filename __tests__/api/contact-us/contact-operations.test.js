import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Contact from '../../../src/app/api/models/contact-us.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestContact } from '../../utils/testHelpers.js';

describe('Contact API - Contact Form Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/contact-us - Submit Contact Form', () => {
    test('should create contact message with all required fields', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message',
      };

      const contact = await Contact.create(contactData);
      expect(contact._id).toBeDefined();
      expect(contact.name).toBe('John Doe');
      expect(contact.email).toBe('john@example.com');
      expect(contact.message).toBe('This is a test message');
      expect(contact.createdAt).toBeDefined();
    });

    test('should fail without required name field', async () => {
      const contactData = {
        email: 'john@example.com',
        message: 'Test message',
      };

      await expect(Contact.create(contactData)).rejects.toThrow();
    });

    test('should fail without required email field', async () => {
      const contactData = {
        name: 'John Doe',
        message: 'Test message',
      };

      await expect(Contact.create(contactData)).rejects.toThrow();
    });

    test('should fail without required message field', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      await expect(Contact.create(contactData)).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message',
      };

      await expect(Contact.create(contactData)).rejects.toThrow();
    });

    test('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      for (const email of validEmails) {
        const contact = await Contact.create({
          name: 'Test User',
          email: email,
          message: 'Test message',
        });
        expect(contact.email).toBe(email);
      }
    });
  });

  describe('Get Contact Messages', () => {
    test('should return empty array when no messages exist', async () => {
      const contacts = await Contact.find({});
      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts).toHaveLength(0);
    });

    test('should return all contact messages', async () => {
      await createTestContact({ name: 'User 1', email: 'user1@example.com' });
      await createTestContact({ name: 'User 2', email: 'user2@example.com' });

      const contacts = await Contact.find({});
      expect(contacts).toHaveLength(2);
    });

    test('should find contact by email', async () => {
      await createTestContact({ 
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });

      const contact = await Contact.findOne({ email: 'john@example.com' });
      expect(contact).toBeDefined();
      expect(contact.name).toBe('John Doe');
    });

    test('should sort contacts by creation date', async () => {
      const contact1 = await createTestContact({ name: 'First' });
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const contact2 = await createTestContact({ name: 'Second' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const contact3 = await createTestContact({ name: 'Third' });

      const contacts = await Contact.find({}).sort({ createdAt: 1 });
      expect(contacts[0].name).toBe('First');
      expect(contacts[1].name).toBe('Second');
      expect(contacts[2].name).toBe('Third');
    });
  });

  describe('Contact Message Properties', () => {
    test('should have timestamps', async () => {
      const contact = await createTestContact({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      });

      expect(contact.createdAt).toBeDefined();
      expect(contact.updatedAt).toBeDefined();
      expect(contact.createdAt).toBeInstanceOf(Date);
      expect(contact.updatedAt).toBeInstanceOf(Date);
    });

    test('should handle long messages', async () => {
      const longMessage = 'A'.repeat(1000);
      const contact = await Contact.create({
        name: 'Test User',
        email: 'test@example.com',
        message: longMessage,
      });

      expect(contact.message).toBe(longMessage);
      expect(contact.message.length).toBe(1000);
    });

    test('should handle special characters in message', async () => {
      const specialMessage = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const contact = await Contact.create({
        name: 'Test User',
        email: 'test@example.com',
        message: specialMessage,
      });

      expect(contact.message).toBe(specialMessage);
    });
  });

  describe('Delete Contact Messages', () => {
    test('should delete contact message successfully', async () => {
      const contact = await createTestContact({
        name: 'To Be Deleted',
        email: 'delete@example.com',
      });

      await Contact.findByIdAndDelete(contact._id);

      const found = await Contact.findById(contact._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await Contact.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });
});
