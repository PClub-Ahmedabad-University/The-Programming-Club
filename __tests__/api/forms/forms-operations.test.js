import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Form from '../../../src/app/api/models/form.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Forms API - Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/forms - Create Form', () => {
    test('should create form with basic fields', async () => {
      const formData = {
        title: 'Registration Form',
        fields: [
          {
            label: 'Full Name',
            name: 'fullName',
            type: 'text',
            required: true,
          },
          {
            label: 'Email',
            name: 'email',
            type: 'email',
            required: true,
          },
        ],
        state: 'open',
      };

      const form = await Form.create(formData);
      expect(form._id).toBeDefined();
      expect(form.title).toBe('Registration Form');
      expect(form.fields).toHaveLength(2);
      expect(form.state).toBe('open');
    });

    test('should fail without required title', async () => {
      const formData = {
        fields: [],
        state: 'open',
      };

      await expect(Form.create(formData)).rejects.toThrow();
    });

    test('should default state to closed', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [],
      });

      expect(form.state).toBe('closed');
    });

    test('should default isEvent to false', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [],
      });

      expect(form.isEvent).toBe(false);
    });

    test('should create form with select field and options', async () => {
      const form = await Form.create({
        title: 'Survey Form',
        fields: [
          {
            label: 'Choose Option',
            name: 'option',
            type: 'select',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        ],
      });

      expect(form.fields[0].options).toHaveLength(2);
      expect(form.fields[0].options[0].label).toBe('Option 1');
    });

    test('should create form with radio buttons', async () => {
      const form = await Form.create({
        title: 'Choice Form',
        fields: [
          {
            label: 'Select One',
            name: 'choice',
            type: 'radio',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ],
          },
        ],
      });

      expect(form.fields[0].type).toBe('radio');
      expect(form.fields[0].options).toHaveLength(2);
    });

    test('should create form with textarea field', async () => {
      const form = await Form.create({
        title: 'Feedback Form',
        fields: [
          {
            label: 'Comments',
            name: 'comments',
            type: 'textarea',
            rows: 5,
          },
        ],
      });

      expect(form.fields[0].type).toBe('textarea');
      expect(form.fields[0].rows).toBe(5);
    });

    test('should create form with file upload field', async () => {
      const form = await Form.create({
        title: 'Upload Form',
        fields: [
          {
            label: 'Upload Document',
            name: 'document',
            type: 'file',
            accept: '.pdf,.doc',
          },
        ],
      });

      expect(form.fields[0].type).toBe('file');
      expect(form.fields[0].accept).toBe('.pdf,.doc');
    });
  });

  describe('GET /api/forms - Get All Forms', () => {
    test('should return empty array when no forms exist', async () => {
      const forms = await Form.find({});
      expect(Array.isArray(forms)).toBe(true);
      expect(forms).toHaveLength(0);
    });

    test('should return all forms', async () => {
      await Form.create({
        title: 'Form 1',
        fields: [],
      });
      await Form.create({
        title: 'Form 2',
        fields: [],
      });

      const forms = await Form.find({});
      expect(forms).toHaveLength(2);
    });

    test('should filter forms by state', async () => {
      await Form.create({
        title: 'Open Form',
        fields: [],
        state: 'open',
      });
      await Form.create({
        title: 'Closed Form',
        fields: [],
        state: 'closed',
      });

      const openForms = await Form.find({ state: 'open' });
      expect(openForms).toHaveLength(1);
      expect(openForms[0].title).toBe('Open Form');
    });

    test('should filter event forms', async () => {
      await Form.create({
        title: 'Event Form',
        fields: [],
        isEvent: true,
        eventId: '507f1f77bcf86cd799439011',
      });
      await Form.create({
        title: 'Regular Form',
        fields: [],
        isEvent: false,
      });

      const eventForms = await Form.find({ isEvent: true });
      expect(eventForms).toHaveLength(1);
      expect(eventForms[0].title).toBe('Event Form');
    });
  });

  describe('GET /api/forms/[formId] - Get Form by ID', () => {
    test('should find form by ID', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [
          {
            label: 'Name',
            name: 'name',
            type: 'text',
          },
        ],
      });

      const found = await Form.findById(form._id);
      expect(found).toBeDefined();
      expect(found.title).toBe('Test Form');
      expect(found.fields).toHaveLength(1);
    });

    test('should return null for non-existent form', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const form = await Form.findById(fakeId);
      expect(form).toBeNull();
    });
  });

  describe('Update Form', () => {
    test('should update form title', async () => {
      const form = await Form.create({
        title: 'Old Title',
        fields: [],
      });

      const updated = await Form.findByIdAndUpdate(
        form._id,
        { title: 'New Title' },
        { new: true }
      );

      expect(updated.title).toBe('New Title');
    });

    test('should update form state', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [],
        state: 'closed',
      });

      const updated = await Form.findByIdAndUpdate(
        form._id,
        { state: 'open' },
        { new: true }
      );

      expect(updated.state).toBe('open');
    });

    test('should add fields to form', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [],
      });

      const updated = await Form.findByIdAndUpdate(
        form._id,
        {
          $push: {
            fields: {
              label: 'New Field',
              name: 'newField',
              type: 'text',
            },
          },
        },
        { new: true }
      );

      expect(updated.fields).toHaveLength(1);
      expect(updated.fields[0].label).toBe('New Field');
    });
  });

  describe('DELETE /api/forms/[formId] - Delete Form', () => {
    test('should delete form', async () => {
      const form = await Form.create({
        title: 'To Delete',
        fields: [],
      });

      await Form.findByIdAndDelete(form._id);

      const found = await Form.findById(form._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent form', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await Form.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });

  describe('Form Field Validation', () => {
    test('should require label for field', async () => {
      await expect(
        Form.create({
          title: 'Test Form',
          fields: [
            {
              name: 'test',
              type: 'text',
            },
          ],
        })
      ).rejects.toThrow();
    });

    test('should require name for field', async () => {
      await expect(
        Form.create({
          title: 'Test Form',
          fields: [
            {
              label: 'Test',
              type: 'text',
            },
          ],
        })
      ).rejects.toThrow();
    });

    test('should default required to false', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [
          {
            label: 'Test',
            name: 'test',
            type: 'text',
          },
        ],
      });

      expect(form.fields[0].required).toBe(false);
    });

    test('should allow setting required to true', async () => {
      const form = await Form.create({
        title: 'Test Form',
        fields: [
          {
            label: 'Test',
            name: 'test',
            type: 'text',
            required: true,
          },
        ],
      });

      expect(form.fields[0].required).toBe(true);
    });
  });
});
