import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import RecruitmentRole from '../../../src/app/api/models/recruitment.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Recruitment API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/recruitment/add - Add Recruitment Role', () => {
    test('should create recruitment role with all required fields', async () => {
      const roleData = {
        title: 'Frontend Developer',
        image: 'https://example.com/frontend.jpg',
        google_form: 'https://forms.google.com/frontend',
        description: 'Looking for frontend developers with React experience',
        isRecruitmentOpen: true,
      };

      const role = await RecruitmentRole.create(roleData);
      expect(role._id).toBeDefined();
      expect(role.title).toBe('Frontend Developer');
      expect(role.google_form).toBe('https://forms.google.com/frontend');
      expect(role.isRecruitmentOpen).toBe(true);
    });

    test('should fail without required title', async () => {
      const roleData = {
        image: 'https://example.com/image.jpg',
        google_form: 'https://forms.google.com/form',
        description: 'Test description',
      };

      await expect(RecruitmentRole.create(roleData)).rejects.toThrow();
    });

    test('should fail without required image', async () => {
      const roleData = {
        title: 'Developer',
        google_form: 'https://forms.google.com/form',
        description: 'Test description',
      };

      await expect(RecruitmentRole.create(roleData)).rejects.toThrow();
    });

    test('should fail without required google_form', async () => {
      const roleData = {
        title: 'Developer',
        image: 'https://example.com/image.jpg',
        description: 'Test description',
      };

      await expect(RecruitmentRole.create(roleData)).rejects.toThrow();
    });

    test('should fail without required description', async () => {
      const roleData = {
        title: 'Developer',
        image: 'https://example.com/image.jpg',
        google_form: 'https://forms.google.com/form',
      };

      await expect(RecruitmentRole.create(roleData)).rejects.toThrow();
    });

    test('should default isRecruitmentOpen to false', async () => {
      const role = await RecruitmentRole.create({
        title: 'Developer',
        image: 'https://example.com/image.jpg',
        google_form: 'https://forms.google.com/form',
        description: 'Test description',
      });

      expect(role.isRecruitmentOpen).toBe(false);
    });

    test('should have timestamps', async () => {
      const role = await RecruitmentRole.create({
        title: 'Developer',
        image: 'https://example.com/image.jpg',
        google_form: 'https://forms.google.com/form',
        description: 'Test description',
      });

      expect(role.createdAt).toBeDefined();
      expect(role.updatedAt).toBeDefined();
    });
  });

  describe('GET /api/recruitment/get - Get All Roles', () => {
    test('should return empty array when no roles exist', async () => {
      const roles = await RecruitmentRole.find({});
      expect(Array.isArray(roles)).toBe(true);
      expect(roles).toHaveLength(0);
    });

    test('should return all recruitment roles', async () => {
      await RecruitmentRole.create({
        title: 'Frontend Developer',
        image: 'https://example.com/frontend.jpg',
        google_form: 'https://forms.google.com/frontend',
        description: 'Frontend role',
      });
      await RecruitmentRole.create({
        title: 'Backend Developer',
        image: 'https://example.com/backend.jpg',
        google_form: 'https://forms.google.com/backend',
        description: 'Backend role',
      });

      const roles = await RecruitmentRole.find({});
      expect(roles).toHaveLength(2);
    });

    test('should filter open recruitments', async () => {
      await RecruitmentRole.create({
        title: 'Open Role',
        image: 'https://example.com/open.jpg',
        google_form: 'https://forms.google.com/open',
        description: 'Open position',
        isRecruitmentOpen: true,
      });
      await RecruitmentRole.create({
        title: 'Closed Role',
        image: 'https://example.com/closed.jpg',
        google_form: 'https://forms.google.com/closed',
        description: 'Closed position',
        isRecruitmentOpen: false,
      });

      const openRoles = await RecruitmentRole.find({ isRecruitmentOpen: true });
      expect(openRoles).toHaveLength(1);
      expect(openRoles[0].title).toBe('Open Role');
    });
  });

  describe('GET /api/recruitment/get/[id] - Get Role by ID', () => {
    test('should find recruitment role by ID', async () => {
      const role = await RecruitmentRole.create({
        title: 'Test Role',
        image: 'https://example.com/test.jpg',
        google_form: 'https://forms.google.com/test',
        description: 'Test description',
      });

      const found = await RecruitmentRole.findById(role._id);
      expect(found).toBeDefined();
      expect(found.title).toBe('Test Role');
    });

    test('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const role = await RecruitmentRole.findById(fakeId);
      expect(role).toBeNull();
    });
  });

  describe('PATCH /api/recruitment/update/[id] - Update Role', () => {
    test('should update recruitment status', async () => {
      const role = await RecruitmentRole.create({
        title: 'Developer',
        image: 'https://example.com/dev.jpg',
        google_form: 'https://forms.google.com/dev',
        description: 'Developer position',
        isRecruitmentOpen: false,
      });

      const updated = await RecruitmentRole.findByIdAndUpdate(
        role._id,
        { isRecruitmentOpen: true },
        { new: true }
      );

      expect(updated.isRecruitmentOpen).toBe(true);
    });

    test('should update title and description', async () => {
      const role = await RecruitmentRole.create({
        title: 'Old Title',
        image: 'https://example.com/image.jpg',
        google_form: 'https://forms.google.com/form',
        description: 'Old description',
      });

      const updated = await RecruitmentRole.findByIdAndUpdate(
        role._id,
        { 
          title: 'New Title',
          description: 'New description',
        },
        { new: true }
      );

      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('New description');
    });
  });

  describe('DELETE /api/recruitment/delete/[id] - Delete Role', () => {
    test('should delete recruitment role', async () => {
      const role = await RecruitmentRole.create({
        title: 'To Delete',
        image: 'https://example.com/delete.jpg',
        google_form: 'https://forms.google.com/delete',
        description: 'Will be deleted',
      });

      await RecruitmentRole.findByIdAndDelete(role._id);

      const found = await RecruitmentRole.findById(role._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent role', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await RecruitmentRole.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });
});
