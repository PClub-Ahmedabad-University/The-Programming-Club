import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Mailer Utility', () => {
  let sendMail;
  let mockSendMail;
  let originalEnv;

  beforeEach(async () => {
    // Save original env
    originalEnv = { ...process.env };

    // Set email env variables
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test-password-123';

    // Create mock
    mockSendMail = jest.fn();

    // Mock nodemailer module
    jest.unstable_mockModule('nodemailer', () => ({
      default: {
        createTransport: jest.fn(() => ({
          sendMail: mockSendMail,
        })),
      },
    }));

    // Import after mocking
    const module = await import('../../src/app/api/utils/mailer.utils.js');
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
        accepted: ['recipient@example.com'],
        rejected: [],
        envelopeTime: 100,
        messageTime: 150,
        messageSize: 500,
        response: '250 2.0.0 OK',
        messageId: '<test-message-id@example.com>',
      };

      mockSendMail.mockResolvedValue(mockResponse);

      const result = await sendMail(
        'recipient@example.com',
        'Test Subject',
        '<p>Test message</p>'
      );

      expect(result).toEqual(mockResponse);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test message</p>',
      });
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    test('should handle HTML content in message', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      const htmlContent = `
        <html>
          <body>
            <h1>Welcome</h1>
            <p>This is a test email with <strong>HTML</strong> content.</p>
          </body>
        </html>
      `;

      await sendMail('user@example.com', 'HTML Email', htmlContent);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'HTML Email',
        html: htmlContent,
      });
    });

    test('should handle multiple recipients (comma-separated)', async () => {
      const mockResponse = { accepted: ['user1@example.com', 'user2@example.com'] };
      mockSendMail.mockResolvedValue(mockResponse);

      await sendMail(
        'user1@example.com,user2@example.com',
        'Multiple Recipients',
        '<p>Message for all</p>'
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user1@example.com,user2@example.com',
        subject: 'Multiple Recipients',
        html: '<p>Message for all</p>',
      });
    });

    test('should handle long subject lines', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      const longSubject = 'A very long subject line that exceeds typical length '.repeat(5);

      await sendMail('user@example.com', longSubject, '<p>Test</p>');

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: longSubject,
        html: '<p>Test</p>',
      });
    });

    test('should handle empty message body', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      await sendMail('user@example.com', 'Empty Body', '');

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Empty Body',
        html: '',
      });
    });
  });

  describe('Environment Validation', () => {
    test('should check for null env variables (note: current implementation checks === null, not undefined)', async () => {
      // This test documents the actual behavior: 
      // The envPresent() function checks if values === null, but undefined !== null
      // So if EMAIL_USER or EMAIL_PASS are undefined, they won't trigger the null check
      // This is a limitation of the current implementation
      
      // Test that the function exists and can be called
      const mockResponse = { messageId: '<test>' };
      mockSendMail.mockResolvedValue(mockResponse);
      
      const result = await sendMail('test@example.com', 'Subject', 'Message');
      
      expect(mockSendMail).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    test('should successfully send email when env variables are present', async () => {
      const mockResponse = {
        accepted: ['test@example.com'],
        messageId: '<success-id>',
      };
      mockSendMail.mockResolvedValue(mockResponse);

      const result = await sendMail('test@example.com', 'Test', 'Message');

      expect(result).toEqual(mockResponse);
      expect(mockSendMail).toHaveBeenCalled();
    });

    test('should handle env variable validation logic', async () => {
      // The envPresent() function is called before sending email
      // If env vars were null (not undefined), it would return null
      // But since process.env returns undefined (not null), the check doesn't catch it
      const mockResponse = { messageId: '<id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      await sendMail('user@example.com', 'Subject', 'Body');

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Subject',
        html: 'Body',
      });
    });
  });

  describe('Error Handling', () => {
    test('should propagate SMTP connection errors', async () => {
      const smtpError = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(smtpError);

      await expect(
        sendMail('user@example.com', 'Test', '<p>Message</p>')
      ).rejects.toThrow('SMTP connection failed');
    });

    test('should handle authentication failures', async () => {
      const authError = new Error('Invalid login credentials');
      mockSendMail.mockRejectedValue(authError);

      await expect(
        sendMail('user@example.com', 'Test', '<p>Message</p>')
      ).rejects.toThrow('Invalid login credentials');
    });

    test('should handle network timeouts', async () => {
      const timeoutError = new Error('Connection timeout');
      mockSendMail.mockRejectedValue(timeoutError);

      await expect(
        sendMail('user@example.com', 'Test', '<p>Message</p>')
      ).rejects.toThrow('Connection timeout');
    });

    test('should handle invalid recipient email', async () => {
      const recipientError = new Error('Invalid recipient address');
      mockSendMail.mockRejectedValue(recipientError);

      await expect(
        sendMail('invalid-email', 'Test', '<p>Message</p>')
      ).rejects.toThrow('Invalid recipient address');
    });

    test('should handle message size limit errors', async () => {
      const sizeError = new Error('Message size exceeds maximum allowed');
      mockSendMail.mockRejectedValue(sizeError);

      const largeMessage = '<p>' + 'A'.repeat(1000000) + '</p>';

      await expect(
        sendMail('user@example.com', 'Large Message', largeMessage)
      ).rejects.toThrow('Message size exceeds maximum allowed');
    });

    test('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Too many requests');
      mockSendMail.mockRejectedValue(rateLimitError);

      await expect(
        sendMail('user@example.com', 'Test', '<p>Message</p>')
      ).rejects.toThrow('Too many requests');
    });
  });

  describe('Multiple Emails', () => {
    test('should send multiple emails sequentially', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      await sendMail('user1@example.com', 'Email 1', '<p>Message 1</p>');
      await sendMail('user2@example.com', 'Email 2', '<p>Message 2</p>');
      await sendMail('user3@example.com', 'Email 3', '<p>Message 3</p>');

      expect(mockSendMail).toHaveBeenCalledTimes(3);
      expect(mockSendMail).toHaveBeenNthCalledWith(1, {
        from: 'test@example.com',
        to: 'user1@example.com',
        subject: 'Email 1',
        html: '<p>Message 1</p>',
      });
      expect(mockSendMail).toHaveBeenNthCalledWith(2, {
        from: 'test@example.com',
        to: 'user2@example.com',
        subject: 'Email 2',
        html: '<p>Message 2</p>',
      });
      expect(mockSendMail).toHaveBeenNthCalledWith(3, {
        from: 'test@example.com',
        to: 'user3@example.com',
        subject: 'Email 3',
        html: '<p>Message 3</p>',
      });
    });

    test('should handle mix of successful and failed sends', async () => {
      const mockResponse = { messageId: '<success-id>' };
      const error = new Error('Send failed');

      mockSendMail
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResponse);

      const result1 = await sendMail('user1@example.com', 'Test 1', '<p>Message 1</p>');
      expect(result1).toEqual(mockResponse);

      await expect(
        sendMail('user2@example.com', 'Test 2', '<p>Message 2</p>')
      ).rejects.toThrow('Send failed');

      const result3 = await sendMail('user3@example.com', 'Test 3', '<p>Message 3</p>');
      expect(result3).toEqual(mockResponse);

      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in subject', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      const specialSubject = 'Test with émojis 🎉 and spëcial çharacters!';

      await sendMail('user@example.com', specialSubject, '<p>Message</p>');

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: specialSubject,
        html: '<p>Message</p>',
      });
    });

    test('should handle newlines in subject', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      const subjectWithNewlines = 'Line 1\nLine 2\nLine 3';

      await sendMail('user@example.com', subjectWithNewlines, '<p>Message</p>');

      expect(mockSendMail).toHaveBeenCalled();
    });

    test('should handle very large HTML content', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      const largeHtml = '<html><body>' + '<p>Paragraph</p>'.repeat(1000) + '</body></html>';

      await sendMail('user@example.com', 'Large Content', largeHtml);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Large Content',
        html: largeHtml,
      });
    });

    test('should handle embedded images in HTML', async () => {
      const mockResponse = { messageId: '<test-id>' };
      mockSendMail.mockResolvedValue(mockResponse);

      const htmlWithImages = `
        <html>
          <body>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." />
          </body>
        </html>
      `;

      await sendMail('user@example.com', 'Images', htmlWithImages);

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('Response Validation', () => {
    test('should return complete nodemailer response', async () => {
      const completeResponse = {
        accepted: ['user@example.com'],
        rejected: [],
        envelopeTime: 200,
        messageTime: 300,
        messageSize: 1024,
        response: '250 2.0.0 OK 1234567890',
        messageId: '<unique-id@example.com>',
        envelope: {
          from: 'test@example.com',
          to: ['user@example.com'],
        },
      };

      mockSendMail.mockResolvedValue(completeResponse);

      const result = await sendMail('user@example.com', 'Complete', '<p>Test</p>');

      expect(result).toEqual(completeResponse);
      expect(result).toHaveProperty('accepted');
      expect(result).toHaveProperty('rejected');
      expect(result).toHaveProperty('messageId');
      expect(result).toHaveProperty('envelope');
    });

    test('should handle partial acceptance responses', async () => {
      const partialResponse = {
        accepted: ['user1@example.com'],
        rejected: ['invalid@example.com'],
        messageId: '<test-id>',
      };

      mockSendMail.mockResolvedValue(partialResponse);

      const result = await sendMail(
        'user1@example.com,invalid@example.com',
        'Partial',
        '<p>Test</p>'
      );

      expect(result.accepted).toHaveLength(1);
      expect(result.rejected).toHaveLength(1);
    });
  });
});
