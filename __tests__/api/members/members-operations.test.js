import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Member from '../../../src/app/api/models/member.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';
import { createTestMember } from '../../utils/testHelpers.js';

describe('Members API - CRUD Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/members/get - Get All Members', () => {
    test('should return empty array when no members exist', async () => {
      const members = await Member.find({});
      expect(Array.isArray(members)).toBe(true);
      expect(members).toHaveLength(0);
    });

    test('should return all members when members exist', async () => {
      await createTestMember({ name: 'Alice Johnson', position: 'Secretary' });
      await createTestMember({ name: 'Bob Smith', position: 'President' });

      const members = await Member.find({});
      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('Alice Johnson');
      expect(members[1].name).toBe('Bob Smith');
    });

    test('should return members with correct structure', async () => {
      await createTestMember({
        name: 'Alice Johnson',
        position: 'Secretary',
        term: '2024-2025',
        linkedinId: 'alice-johnson',
        pfpImage: 'https://example.com/alice.jpg',
      });

      const members = await Member.find({});
      expect(members[0]).toHaveProperty('_id');
      expect(members[0]).toHaveProperty('name');
      expect(members[0]).toHaveProperty('position');
      expect(members[0]).toHaveProperty('term');
      expect(members[0]).toHaveProperty('linkedinId');
      expect(members[0]).toHaveProperty('pfpImage');
      expect(members[0]).toHaveProperty('createdAt');
      expect(members[0]).toHaveProperty('updatedAt');
    });
  });

  describe('POST /api/members/add - Add New Member', () => {
    test('should create member with all required fields', async () => {
      const memberData = {
        name: 'John Doe',
        position: 'President',
        term: '2024-2025',
      };

      const member = await Member.create(memberData);
      expect(member._id).toBeDefined();
      expect(member.name).toBe('John Doe');
      expect(member.position).toBe('President');
      expect(member.term).toBe('2024-2025');
    });

    test('should create member with optional fields', async () => {
      const memberData = {
        name: 'Jane Smith',
        position: 'Vice President',
        term: '2024-2025',
        linkedinId: 'jane-smith',
        pfpImage: 'https://example.com/jane.jpg',
      };

      const member = await Member.create(memberData);
      expect(member.linkedinId).toBe('jane-smith');
      expect(member.pfpImage).toBe('https://example.com/jane.jpg');
    });

    test('should fail without required name field', async () => {
      const memberData = {
        position: 'President',
        term: '2024-2025',
      };

      await expect(Member.create(memberData)).rejects.toThrow();
    });

    test('should fail without required position field', async () => {
      const memberData = {
        name: 'John Doe',
        term: '2024-2025',
      };

      await expect(Member.create(memberData)).rejects.toThrow();
    });

    test('should fail without required term field', async () => {
      const memberData = {
        name: 'John Doe',
        position: 'President',
      };

      await expect(Member.create(memberData)).rejects.toThrow();
    });
  });

  describe('Filter Members by Term', () => {
    test('should filter members by term', async () => {
      await createTestMember({ name: 'Current Member 1', term: '2024-2025' });
      await createTestMember({ name: 'Current Member 2', term: '2024-2025' });
      await createTestMember({ name: 'Past Member', term: '2023-2024' });

      const currentMembers = await Member.find({ term: '2024-2025' });
      expect(currentMembers).toHaveLength(2);
      expect(currentMembers.every(m => m.term === '2024-2025')).toBe(true);
    });

    test('should filter members by position', async () => {
      await createTestMember({ name: 'President 1', position: 'President' });
      await createTestMember({ name: 'Secretary 1', position: 'Secretary' });
      await createTestMember({ name: 'President 2', position: 'President' });

      const presidents = await Member.find({ position: 'President' });
      expect(presidents).toHaveLength(2);
      expect(presidents.every(m => m.position === 'President')).toBe(true);
    });
  });

  describe('UPDATE /api/members/update - Update Member', () => {
    test('should update member successfully', async () => {
      const member = await createTestMember({ 
        name: 'Original Name',
        position: 'Member',
      });

      const updated = await Member.findByIdAndUpdate(
        member._id,
        { position: 'Secretary' },
        { new: true }
      );

      expect(updated.position).toBe('Secretary');
      expect(updated.name).toBe('Original Name');
    });

    test('should update multiple fields', async () => {
      const member = await createTestMember({ 
        name: 'John Doe',
        position: 'Member',
        linkedinId: 'old-id',
      });

      const updated = await Member.findByIdAndUpdate(
        member._id,
        { 
          position: 'President',
          linkedinId: 'new-id',
        },
        { new: true }
      );

      expect(updated.position).toBe('President');
      expect(updated.linkedinId).toBe('new-id');
    });
  });

  describe('DELETE /api/members/delete - Delete Member', () => {
    test('should delete member successfully', async () => {
      const member = await createTestMember({ 
        name: 'To Be Deleted',
        position: 'Member',
      });

      await Member.findByIdAndDelete(member._id);

      const found = await Member.findById(member._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent member', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await Member.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });

  describe('Find Member by ID', () => {
    test('should find member by ID', async () => {
      const member = await createTestMember({
        name: 'Test Member',
        position: 'President',
      });

      const found = await Member.findById(member._id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Test Member');
      expect(found._id.toString()).toBe(member._id.toString());
    });

    test('should return null for non-existent member ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const member = await Member.findById(fakeId);
      expect(member).toBeNull();
    });
  });
});
