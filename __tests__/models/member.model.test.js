import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Member from '../../src/app/api/models/member.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../utils/testDb.js';
import { mockMemberData } from '../fixtures/mockData.js';

describe('Member Model Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Member Creation', () => {
    test('should create member with all fields', async () => {
      const member = await Member.create(mockMemberData.valid);
      
      expect(member._id).toBeDefined();
      expect(member.name).toBe(mockMemberData.valid.name);
      expect(member.position).toBe(mockMemberData.valid.position);
      expect(member.term).toBe(mockMemberData.valid.term);
      expect(member.linkedinId).toBe(mockMemberData.valid.linkedinId);
      expect(member.pfpImage).toBe(mockMemberData.valid.pfpImage);
    });

    test('should create member with only required fields', async () => {
      const member = await Member.create(mockMemberData.minimal);
      
      expect(member._id).toBeDefined();
      expect(member.name).toBe(mockMemberData.minimal.name);
      expect(member.position).toBe(mockMemberData.minimal.position);
      expect(member.term).toBe(mockMemberData.minimal.term);
    });

    test('should fail without required name field', async () => {
      const invalidData = { ...mockMemberData.minimal };
      delete invalidData.name;

      await expect(Member.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required position field', async () => {
      const invalidData = { ...mockMemberData.minimal };
      delete invalidData.position;

      await expect(Member.create(invalidData)).rejects.toThrow();
    });

    test('should fail without required term field', async () => {
      const invalidData = { ...mockMemberData.minimal };
      delete invalidData.term;

      await expect(Member.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Member Query', () => {
    test('should find member by name', async () => {
      await Member.create(mockMemberData.valid);
      const found = await Member.findOne({ name: mockMemberData.valid.name });
      
      expect(found).toBeDefined();
      expect(found.name).toBe(mockMemberData.valid.name);
    });

    test('should find members by term', async () => {
      await Member.create(mockMemberData.valid);
      await Member.create(mockMemberData.minimal);
      
      const members = await Member.find({ term: '2024' });
      expect(members).toHaveLength(2);
    });

    test('should find member by position', async () => {
      await Member.create(mockMemberData.valid);
      const found = await Member.findOne({ position: 'President' });
      
      expect(found).toBeDefined();
      expect(found.position).toBe('President');
    });
  });
});
