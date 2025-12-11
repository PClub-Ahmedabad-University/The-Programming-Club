import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Mailv2 Utility (Resend)', () => {
  let sendMail;
  let mockResendSend;
  let originalEnv;

  beforeEach(async () => {
    // Save original env
    originalEnv = { ...process.env };

    // Set Resend env variables
    process.env.resendKey = 'test-resend-key-123';
    process.env.resendMail = 'noreply@test.com';

    // Create mock
    mockResendSend = jest.fn();

    // Mock Resend module
    jest.unstable_mockModule('resend', () => ({
      Resend: jest.fn(() => ({
        emails: {
          send: mockResendSend,
        },
      })),
    }));

    // Import after mocking
    const module = await import('../../src/app/api/utils/mailv2.utils.js');
    sendMail = module.sendMail;
  });

  afterEach(async () => {
    // Restore env
    process.env = originalEnv;
    // Clear mocks
    jest.clearAllMocks();
    // Reset modules
    jest.resetModules();
  });

  describe('Successful Email Sending', () => {
    test('should send email successfully with valid parameters', async () => {
      const mockResponse = {
        id: 'email-id-123',
        from: 'noreply@test.com',
        to: ['recipient@example.com'],
        created_at: '2024-01-01T00:00:00Z',
      };

      mockResendSend.mockResolvedValue(mockResponse);

      const result = await sendMail(
        'recipient@example.com',
        'Test Subject',
        '<p>Test message</p>'
      );

      expect(result).toEqual({ success: true, data: mockResponse });
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test message</p>',
      });
      expect(mockResendSend).toHaveBeenCalledTimes(1);
    });

    test('should handle HTML content in message', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const htmlContent = `
        <html>
          <body>
            <h1>Welcome</h1>
            <p>This is a <strong>test</strong> email.</p>
          </body>
        </html>
      `;

      const result = await sendMail('user@example.com', 'HTML Email', htmlContent);

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@example.com',
        subject: 'HTML Email',
        html: htmlContent,
      });
    });

    test('should handle array of recipients', async () => {
      const mockResponse = { id: 'email-id', to: ['user1@example.com', 'user2@example.com'] };
      mockResendSend.mockResolvedValue(mockResponse);

      const recipients = ['user1@example.com', 'user2@example.com'];
      const result = await sendMail(recipients, 'Multi Recipients', '<p>Message</p>');

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: recipients,
        subject: 'Multi Recipients',
        html: '<p>Message</p>',
      });
    });

    test('should handle single recipient as string', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      await sendMail('single@example.com', 'Single Recipient', '<p>Test</p>');

      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'single@example.com',
        subject: 'Single Recipient',
        html: '<p>Test</p>',
      });
    });

    test('should handle long subject lines', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const longSubject = 'A very long subject line that might exceed typical email limits '.repeat(3);

      const result = await sendMail('user@example.com', longSubject, '<p>Body</p>');

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@example.com',
        subject: longSubject,
        html: '<p>Body</p>',
      });
    });

    test('should handle empty message body', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const result = await sendMail('user@example.com', 'Empty', '');

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@example.com',
        subject: 'Empty',
        html: '',
      });
    });

    test('should return success response with data', async () => {
      const mockResendResponse = {
        id: 'abc123',
        from: 'noreply@test.com',
        to: ['user@example.com'],
        created_at: '2024-01-01T12:00:00Z',
      };

      mockResendSend.mockResolvedValue(mockResendResponse);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockResendResponse);
    });
  });

  describe('Environment Validation', () => {
    test('should return error when resendKey is missing', async () => {
      jest.resetModules();
      delete process.env.resendKey;
      process.env.resendMail = 'test@example.com';

      jest.unstable_mockModule('resend', () => ({
        Resend: jest.fn(() => ({
          emails: { send: jest.fn() },
        })),
      }));

      const module = await import('../../src/app/api/utils/mailv2.utils.js?t=' + Date.now());
      const result = await module.sendMail('user@example.com', 'Test', 'Message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing resendKey');
    });

    test('should return error when resendMail is missing', async () => {
      jest.resetModules();
      process.env.resendKey = 'test-key';
      delete process.env.resendMail;

      jest.unstable_mockModule('resend', () => ({
        Resend: jest.fn(() => ({
          emails: { send: jest.fn() },
        })),
      }));

      const module = await import('../../src/app/api/utils/mailv2.utils.js?t=' + Date.now());
      const result = await module.sendMail('user@example.com', 'Test', 'Message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing resendKey or resendMail');
    });

    test('should return error when both env variables are missing', async () => {
      jest.resetModules();
      delete process.env.resendKey;
      delete process.env.resendMail;

      jest.unstable_mockModule('resend', () => ({
        Resend: jest.fn(() => ({
          emails: { send: jest.fn() },
        })),
      }));

      const module = await import('../../src/app/api/utils/mailv2.utils.js?t=' + Date.now());
      const result = await module.sendMail('user@example.com', 'Test', 'Message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing resendKey or resendMail');
    });
  });

  describe('Error Handling', () => {
    test('should handle Resend API errors gracefully', async () => {
      const apiError = new Error('Resend API error');
      mockResendSend.mockRejectedValue(apiError);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resend API error');
    });

    test('should handle authentication errors', async () => {
      const authError = new Error('Invalid API key');
      mockResendSend.mockRejectedValue(authError);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    test('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      mockResendSend.mockRejectedValue(timeoutError);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timeout');
    });

    test('should handle invalid recipient email', async () => {
      const recipientError = new Error('Invalid recipient address');
      mockResendSend.mockRejectedValue(recipientError);

      const result = await sendMail('invalid-email', 'Test', '<p>Message</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient address');
    });

    test('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      mockResendSend.mockRejectedValue(rateLimitError);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });

    test('should handle message size limit errors', async () => {
      const sizeError = new Error('Message too large');
      mockResendSend.mockRejectedValue(sizeError);

      const largeMessage = '<p>' + 'A'.repeat(1000000) + '</p>';
      const result = await sendMail('user@example.com', 'Large', largeMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message too large');
    });

    test('should handle error objects without message property', async () => {
      const errorObject = { code: 'ERR_001', details: 'Something went wrong' };
      mockResendSend.mockRejectedValue(errorObject);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      mockResendSend.mockRejectedValue(error);

      await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Email send error:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Multiple Emails', () => {
    test('should send multiple emails sequentially', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const result1 = await sendMail('user1@example.com', 'Email 1', '<p>Message 1</p>');
      const result2 = await sendMail('user2@example.com', 'Email 2', '<p>Message 2</p>');
      const result3 = await sendMail('user3@example.com', 'Email 3', '<p>Message 3</p>');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledTimes(3);
    });

    test('should handle mix of successful and failed sends', async () => {
      const mockResponse = { id: 'success-id' };
      const error = new Error('Send failed');

      mockResendSend
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResponse);

      const result1 = await sendMail('user1@example.com', 'Test 1', '<p>Message 1</p>');
      const result2 = await sendMail('user2@example.com', 'Test 2', '<p>Message 2</p>');
      const result3 = await sendMail('user3@example.com', 'Test 3', '<p>Message 3</p>');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledTimes(3);
    });

    test('should handle sending to multiple recipients in one call', async () => {
      const mockResponse = { id: 'bulk-email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
      const result = await sendMail(recipients, 'Bulk Email', '<p>Message for all</p>');

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: recipients,
        subject: 'Bulk Email',
        html: '<p>Message for all</p>',
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in subject', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const specialSubject = 'Test with émojis 🎉 and spëcial çharacters!@#$%';

      const result = await sendMail('user@example.com', specialSubject, '<p>Message</p>');

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@example.com',
        subject: specialSubject,
        html: '<p>Message</p>',
      });
    });

    test('should handle newlines in subject', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const subjectWithNewlines = 'Line 1\nLine 2\nLine 3';

      const result = await sendMail('user@example.com', subjectWithNewlines, '<p>Message</p>');

      expect(result.success).toBe(true);
    });

    test('should handle very large HTML content', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const largeHtml = '<html><body>' + '<p>Paragraph</p>'.repeat(1000) + '</body></html>';

      const result = await sendMail('user@example.com', 'Large Content', largeHtml);

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@example.com',
        subject: 'Large Content',
        html: largeHtml,
      });
    });

    test('should handle embedded images and CSS in HTML', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const complexHtml = `
        <html>
          <head>
            <style>body { font-family: Arial; }</style>
          </head>
          <body>
            <img src="https://example.com/image.png" alt="Logo" />
            <h1>Welcome</h1>
          </body>
        </html>
      `;

      const result = await sendMail('user@example.com', 'Complex HTML', complexHtml);

      expect(result.success).toBe(true);
    });

    test('should handle empty array of recipients', async () => {
      const mockResponse = { id: 'email-id' };
      mockResendSend.mockResolvedValue(mockResponse);

      const result = await sendMail([], 'Empty Recipients', '<p>Message</p>');

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: [],
        subject: 'Empty Recipients',
        html: '<p>Message</p>',
      });
    });
  });

  describe('Response Structure', () => {
    test('should return complete Resend response structure', async () => {
      const completeResponse = {
        id: 'resend-id-abc123',
        from: 'noreply@test.com',
        to: ['user@example.com'],
        created_at: '2024-01-01T12:00:00Z',
        subject: 'Test Email',
      };

      mockResendSend.mockResolvedValue(completeResponse);

      const result = await sendMail('user@example.com', 'Test Email', '<p>Test</p>');

      expect(result).toEqual({ success: true, data: completeResponse });
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('from');
      expect(result.data).toHaveProperty('to');
      expect(result.data).toHaveProperty('created_at');
    });

    test('should handle minimal response from Resend', async () => {
      const minimalResponse = { id: 'minimal-id' };
      mockResendSend.mockResolvedValue(minimalResponse);

      const result = await sendMail('user@example.com', 'Test', '<p>Message</p>');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(minimalResponse);
    });
  });
});
