import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import FormSubmission from '../../../src/app/api/models/submission.model.js';
import Form from '../../../src/app/api/models/form.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Form Submissions API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/forms/[formId]/submissions - Submit Form', () => {
    test('should create form submission', async () => {
      const form = await Form.create({
        title: 'Registration Form',
        fields: [
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
        ],
      });

      const submission = await FormSubmission.create({
        formId: form._id,
        userId: 'user123',
        responses: [
          { question: 'Name', answer: 'John Doe', fieldType: 'text', required: true },
          { question: 'Email', answer: 'john@example.com', fieldType: 'email', required: true },
        ],
      });

      expect(submission._id).toBeDefined();
      expect(submission.formId.toString()).toBe(form._id.toString());
      expect(submission.userId).toBe('user123');
      expect(submission.responses).toHaveLength(2);
      expect(submission.status).toBe('submitted');
    });

    test('should fail without required formId', async () => {
      await expect(
        FormSubmission.create({
          userId: 'user123',
          responses: [],
        })
      ).rejects.toThrow();
    });

    test('should fail without required userId', async () => {
      await expect(
        FormSubmission.create({
          formId: '507f1f77bcf86cd799439011',
          responses: [],
        })
      ).rejects.toThrow();
    });

    test('should store response with question and answer', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [
          { question: 'What is your name?', answer: 'Alice', fieldType: 'text' },
        ],
      });

      expect(submission.responses[0].question).toBe('What is your name?');
      expect(submission.responses[0].answer).toBe('Alice');
      expect(submission.responses[0].fieldType).toBe('text');
    });

    test('should default status to submitted', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [],
      });

      expect(submission.status).toBe('submitted');
    });

    test('should accept pending status', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [],
        status: 'pending',
      });

      expect(submission.status).toBe('pending');
    });

    test('should accept reviewed status', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [],
        status: 'reviewed',
      });

      expect(submission.status).toBe('reviewed');
    });
  });

  describe('GET /api/forms/[formId]/submissions - Get Submissions', () => {
    test('should return empty array when no submissions', async () => {
      const submissions = await FormSubmission.find({});
      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions).toHaveLength(0);
    });

    test('should get submissions by formId', async () => {
      const formId = '507f1f77bcf86cd799439011';
      
      await FormSubmission.create({
        formId,
        userId: 'user1',
        responses: [],
      });
      await FormSubmission.create({
        formId,
        userId: 'user2',
        responses: [],
      });

      const submissions = await FormSubmission.find({ formId });
      expect(submissions).toHaveLength(2);
    });

    test('should get submissions by userId', async () => {
      const userId = 'user123';
      
      await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId,
        responses: [],
      });
      await FormSubmission.create({
        formId: '507f1f77bcf86cd799439012',
        userId,
        responses: [],
      });

      const submissions = await FormSubmission.find({ userId });
      expect(submissions).toHaveLength(2);
    });

    test('should filter by status', async () => {
      await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user1',
        responses: [],
        status: 'pending',
      });
      await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user2',
        responses: [],
        status: 'reviewed',
      });

      const pending = await FormSubmission.find({ status: 'pending' });
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('pending');
    });
  });

  describe('GET /api/forms/submissions/[submissionId] - Get Single Submission', () => {
    test('should find submission by ID', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [
          { question: 'Name', answer: 'Bob', fieldType: 'text' },
        ],
      });

      const found = await FormSubmission.findById(submission._id);
      expect(found).toBeDefined();
      expect(found.userId).toBe('user123');
      expect(found.responses).toHaveLength(1);
    });

    test('should return null for non-existent submission', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const submission = await FormSubmission.findById(fakeId);
      expect(submission).toBeNull();
    });
  });

  describe('Update Submission Status', () => {
    test('should update submission status to reviewed', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [],
        status: 'pending',
      });

      const updated = await FormSubmission.findByIdAndUpdate(
        submission._id,
        { status: 'reviewed' },
        { new: true }
      );

      expect(updated.status).toBe('reviewed');
    });
  });

  describe('Response Data Types', () => {
    test('should store text answer', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [
          { question: 'Name', answer: 'John', fieldType: 'text' },
        ],
      });

      expect(typeof submission.responses[0].answer).toBe('string');
    });

    test('should store number answer', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [
          { question: 'Age', answer: 25, fieldType: 'number' },
        ],
      });

      expect(typeof submission.responses[0].answer).toBe('number');
    });

    test('should store array answer for checkbox', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [
          { question: 'Interests', answer: ['coding', 'music'], fieldType: 'checkbox' },
        ],
      });

      expect(Array.isArray(submission.responses[0].answer)).toBe(true);
      expect(submission.responses[0].answer).toHaveLength(2);
    });

    test('should store file path answer', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [
          { question: 'Resume', answer: '/uploads/resume.pdf', fieldType: 'file' },
        ],
      });

      expect(submission.responses[0].answer).toBe('/uploads/resume.pdf');
      expect(submission.responses[0].fieldType).toBe('file');
    });
  });

  describe('Submission Timestamps', () => {
    test('should auto-set submittedAt timestamp', async () => {
      const submission = await FormSubmission.create({
        formId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        responses: [],
      });

      expect(submission.submittedAt).toBeDefined();
      expect(submission.submittedAt).toBeInstanceOf(Date);
    });
  });
});
