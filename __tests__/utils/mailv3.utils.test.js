import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { sendMail } from '../../src/app/api/utils/mailv3.utils.js';

describe('Mail v3 Utility - sendMail', () => {
  let originalEnv;
  let fetchMock;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    
    // Set required env variables
    process.env.brevoKey = 'test-api-key-123';
    process.env.brevoMail = 'noreply@programmingclub.com';

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    
    // Restore console.error
    console.error.mockRestore();
    
    // Clear fetch mock
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }
  });

  describe('Successful Email Sending', () => {
    test('should send email to single recipient successfully', async () => {
      // Mock successful Brevo API response
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg-123@brevo.com>' }),
        })
      );

      const result = await sendMail(
        'user@example.com',
        'Test Subject',
        '<p>Test HTML content</p>'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ messageId: '<msg-123@brevo.com>' });
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': 'test-api-key-123',
          }),
        })
      );

      // Verify request body
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body).toEqual({
        sender: { email: 'noreply@programmingclub.com' },
        to: [{ email: 'user@example.com' }],
        subject: 'Test Subject',
        htmlContent: '<p>Test HTML content</p>',
      });
    });

    test('should send email to multiple recipients (array)', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg-456@brevo.com>' }),
        })
      );

      const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
      const result = await sendMail(
        recipients,
        'Bulk Email',
        '<p>Bulk message</p>'
      );

      expect(result.success).toBe(true);

      // Verify multiple recipients in request
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.to).toEqual([
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
      ]);
    });

    test('should handle HTML email content with special characters', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg-789@brevo.com>' }),
        })
      );

      const htmlContent = '<p>Hello "World" & <strong>Friends</strong>!</p>';
      const result = await sendMail('user@example.com', 'Special Chars', htmlContent);

      expect(result.success).toBe(true);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.htmlContent).toBe(htmlContent);
    });
  });

  describe('Environment Variable Validation', () => {
    test('should fail when brevoKey is missing', async () => {
      delete process.env.brevoKey;

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing brevoKey or brevoMail in environment');
      expect(console.error).toHaveBeenCalledWith(
        'Email send error:',
        expect.any(Error)
      );
    });

    test('should fail when brevoMail is missing', async () => {
      delete process.env.brevoMail;

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing brevoKey or brevoMail in environment');
    });

    test('should fail when both env variables are missing', async () => {
      delete process.env.brevoKey;
      delete process.env.brevoMail;

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing brevoKey or brevoMail in environment');
    });
  });

  describe('Brevo API Error Handling', () => {
    test('should handle Brevo API error response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({ 
            message: 'Invalid API key',
            code: 'unauthorized' 
          }),
        })
      );

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
      expect(console.error).toHaveBeenCalled();
    });

    test('should handle Brevo API error without message', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({ code: 'unknown_error' }),
        })
      );

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Brevo API error');
    });

    test('should handle network/fetch failure', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network connection failed'))
      );

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network connection failed');
    });

    test('should handle invalid JSON response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => {
            throw new Error('Invalid JSON');
          },
        })
      );

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty recipient array', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg-empty@brevo.com>' }),
        })
      );

      const result = await sendMail([], 'Test', '<p>Test</p>');

      expect(result.success).toBe(true);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.to).toEqual([]);
    });

    test('should handle empty subject', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg-no-subject@brevo.com>' }),
        })
      );

      const result = await sendMail('user@example.com', '', '<p>Test</p>');

      expect(result.success).toBe(true);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.subject).toBe('');
    });

    test('should handle empty HTML content', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg-no-content@brevo.com>' }),
        })
      );

      const result = await sendMail('user@example.com', 'Empty Email', '');

      expect(result.success).toBe(true);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.htmlContent).toBe('');
    });

    test('should handle error object without message property', async () => {
      global.fetch = jest.fn(() => {
        throw { code: 'ERROR_CODE', details: 'Some details' };
      });

      const result = await sendMail('user@example.com', 'Test', '<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Request Structure Validation', () => {
    test('should include all required headers', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg@brevo.com>' }),
        })
      );

      await sendMail('user@example.com', 'Test', '<p>Test</p>');

      const callArgs = global.fetch.mock.calls[0];
      const headers = callArgs[1].headers;
      
      expect(headers['accept']).toBe('application/json');
      expect(headers['content-type']).toBe('application/json');
      expect(headers['api-key']).toBe('test-api-key-123');
    });

    test('should use POST method', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg@brevo.com>' }),
        })
      );

      await sendMail('user@example.com', 'Test', '<p>Test</p>');

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].method).toBe('POST');
    });

    test('should call correct Brevo API endpoint', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messageId: '<msg@brevo.com>' }),
        })
      );

      await sendMail('user@example.com', 'Test', '<p>Test</p>');

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.brevo.com/v3/smtp/email');
    });
  });
});
