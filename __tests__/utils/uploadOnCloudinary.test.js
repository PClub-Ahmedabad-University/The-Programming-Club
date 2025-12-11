import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Cloudinary Upload Utility', () => {
  let uploadOnCloudinary;
  let mockCloudinaryUpload;
  let mockFsUnlink;
  let originalEnv;

  beforeEach(async () => {
    // Save original env
    originalEnv = { ...process.env };
    
    // Set Cloudinary env variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-api-key';
    process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

    // Create mocks
    mockCloudinaryUpload = jest.fn();
    mockFsUnlink = jest.fn();

    // Mock the modules
    jest.unstable_mockModule('cloudinary', () => ({
      v2: {
        config: jest.fn(),
        uploader: {
          upload: mockCloudinaryUpload,
        },
      },
    }));

    jest.unstable_mockModule('fs', () => ({
      default: {
        unlinkSync: mockFsUnlink,
      },
    }));

    // Import after mocking
    const module = await import('../../src/app/api/utils/uploadOnCloudinary.js');
    uploadOnCloudinary = module.uploadOnCloudinary;
  });

  afterEach(async () => {
    // Restore original env
    process.env = originalEnv;
    // Clear mocks
    jest.clearAllMocks();
    // Reset modules
    jest.resetModules();
  });

  describe('Successful Upload', () => {
    test('should upload file to Cloudinary successfully', async () => {
      const mockResponse = {
        public_id: 'test_image_123',
        secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v123/test_image.jpg',
        url: 'http://res.cloudinary.com/test-cloud/image/upload/v123/test_image.jpg',
        format: 'jpg',
        width: 1920,
        height: 1080,
        bytes: 204800,
        resource_type: 'image',
      };

      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const result = await uploadOnCloudinary('/tmp/test-image.jpg');

      expect(result).toEqual(mockResponse);
      expect(mockCloudinaryUpload).toHaveBeenCalledWith(
        '/tmp/test-image.jpg',
        { resource_type: 'auto' }
      );
      expect(mockCloudinaryUpload).toHaveBeenCalledTimes(1);
    });

    test('should upload with resource_type auto', async () => {
      const mockResponse = {
        public_id: 'test_file',
        secure_url: 'https://res.cloudinary.com/test-cloud/raw/upload/v123/test.pdf',
      };

      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      await uploadOnCloudinary('/tmp/document.pdf');

      const callArgs = mockCloudinaryUpload.mock.calls[0];
      expect(callArgs[1]).toEqual({ resource_type: 'auto' });
    });

    test('should handle different file types', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/video.mp4' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const videoResult = await uploadOnCloudinary('/tmp/video.mp4');
      expect(videoResult).toEqual(mockResponse);

      const imageResult = await uploadOnCloudinary('/tmp/image.png');
      expect(imageResult).toEqual(mockResponse);

      const docResult = await uploadOnCloudinary('/tmp/document.pdf');
      expect(docResult).toEqual(mockResponse);

      expect(mockCloudinaryUpload).toHaveBeenCalledTimes(3);
    });
  });

  describe('Null/Empty Path Handling', () => {
    test('should return null when localFilePath is null', async () => {
      const result = await uploadOnCloudinary(null);

      expect(result).toBeNull();
      expect(mockCloudinaryUpload).not.toHaveBeenCalled();
    });

    test('should return null when localFilePath is undefined', async () => {
      const result = await uploadOnCloudinary(undefined);

      expect(result).toBeNull();
      expect(mockCloudinaryUpload).not.toHaveBeenCalled();
    });

    test('should return null when localFilePath is empty string', async () => {
      const result = await uploadOnCloudinary('');

      expect(result).toBeNull();
      expect(mockCloudinaryUpload).not.toHaveBeenCalled();
    });

    test('should return null when localFilePath is falsy value', async () => {
      expect(await uploadOnCloudinary(0)).toBeNull();
      expect(await uploadOnCloudinary(false)).toBeNull();
      expect(mockCloudinaryUpload).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should delete local file and throw error on upload failure', async () => {
      const error = new Error('Cloudinary upload failed');
      mockCloudinaryUpload.mockRejectedValue(error);

      const filePath = '/tmp/test-image.jpg';

      await expect(uploadOnCloudinary(filePath)).rejects.toThrow('Cloudinary upload failed');

      expect(mockFsUnlink).toHaveBeenCalledWith(filePath);
      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
    });

    test('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockCloudinaryUpload.mockRejectedValue(networkError);

      const filePath = '/tmp/network-test.jpg';

      await expect(uploadOnCloudinary(filePath)).rejects.toThrow('Network connection failed');
      expect(mockFsUnlink).toHaveBeenCalledWith(filePath);
    });

    test('should handle authentication errors', async () => {
      const authError = new Error('Invalid API credentials');
      mockCloudinaryUpload.mockRejectedValue(authError);

      const filePath = '/tmp/auth-test.jpg';

      await expect(uploadOnCloudinary(filePath)).rejects.toThrow('Invalid API credentials');
      expect(mockFsUnlink).toHaveBeenCalledWith(filePath);
    });

    test('should handle file size limit errors', async () => {
      const sizeError = new Error('File size exceeds limit');
      mockCloudinaryUpload.mockRejectedValue(sizeError);

      const filePath = '/tmp/large-file.jpg';

      await expect(uploadOnCloudinary(filePath)).rejects.toThrow('File size exceeds limit');
      expect(mockFsUnlink).toHaveBeenCalledWith(filePath);
    });

    test('should handle invalid file format errors', async () => {
      const formatError = new Error('Unsupported file format');
      mockCloudinaryUpload.mockRejectedValue(formatError);

      const filePath = '/tmp/invalid-file.xyz';

      await expect(uploadOnCloudinary(filePath)).rejects.toThrow('Unsupported file format');
      expect(mockFsUnlink).toHaveBeenCalledWith(filePath);
    });
  });

  describe('File Path Validation', () => {
    test('should handle absolute file paths', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/test.jpg' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      await uploadOnCloudinary('/absolute/path/to/file.jpg');

      expect(mockCloudinaryUpload).toHaveBeenCalledWith(
        '/absolute/path/to/file.jpg',
        { resource_type: 'auto' }
      );
    });

    test('should handle relative file paths', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/test.jpg' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      await uploadOnCloudinary('./uploads/file.jpg');

      expect(mockCloudinaryUpload).toHaveBeenCalledWith(
        './uploads/file.jpg',
        { resource_type: 'auto' }
      );
    });

    test('should handle Windows-style paths', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/test.jpg' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      await uploadOnCloudinary('C:\\Users\\uploads\\file.jpg');

      expect(mockCloudinaryUpload).toHaveBeenCalledWith(
        'C:\\Users\\uploads\\file.jpg',
        { resource_type: 'auto' }
      );
    });
  });

  describe('Response Structure', () => {
    test('should return complete Cloudinary response', async () => {
      const mockResponse = {
        public_id: 'sample_image',
        version: 1234567890,
        signature: 'abcdef123456',
        width: 800,
        height: 600,
        format: 'png',
        resource_type: 'image',
        created_at: '2024-01-01T00:00:00Z',
        bytes: 102400,
        type: 'upload',
        url: 'http://res.cloudinary.com/test/image/upload/v123/sample.png',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/sample.png',
      };

      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const result = await uploadOnCloudinary('/tmp/sample.png');

      expect(result).toHaveProperty('public_id');
      expect(result).toHaveProperty('secure_url');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('format');
      expect(result).toEqual(mockResponse);
    });

    test('should preserve all response fields', async () => {
      const mockResponse = {
        public_id: 'test',
        secure_url: 'https://example.com/test.jpg',
        custom_field: 'custom_value',
        metadata: { key: 'value' },
      };

      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const result = await uploadOnCloudinary('/tmp/test.jpg');

      expect(result.custom_field).toBe('custom_value');
      expect(result.metadata).toEqual({ key: 'value' });
    });
  });

  describe('Multiple Uploads', () => {
    test('should handle multiple sequential uploads', async () => {
      const mockResponse1 = { public_id: 'file1', secure_url: 'https://example.com/file1.jpg' };
      const mockResponse2 = { public_id: 'file2', secure_url: 'https://example.com/file2.jpg' };
      const mockResponse3 = { public_id: 'file3', secure_url: 'https://example.com/file3.jpg' };

      mockCloudinaryUpload
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)
        .mockResolvedValueOnce(mockResponse3);

      const result1 = await uploadOnCloudinary('/tmp/file1.jpg');
      const result2 = await uploadOnCloudinary('/tmp/file2.jpg');
      const result3 = await uploadOnCloudinary('/tmp/file3.jpg');

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(result3).toEqual(mockResponse3);
      expect(mockCloudinaryUpload).toHaveBeenCalledTimes(3);
    });

    test('should handle mix of successful and failed uploads', async () => {
      const mockResponse = { public_id: 'success', secure_url: 'https://example.com/success.jpg' };
      const error = new Error('Upload failed');

      mockCloudinaryUpload
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(error);

      const result1 = await uploadOnCloudinary('/tmp/success.jpg');
      expect(result1).toEqual(mockResponse);

      await expect(uploadOnCloudinary('/tmp/failed.jpg')).rejects.toThrow('Upload failed');
      expect(mockFsUnlink).toHaveBeenCalledWith('/tmp/failed.jpg');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long file paths', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/test.jpg' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const longPath = '/very/long/path/'.repeat(20) + 'file.jpg';
      const result = await uploadOnCloudinary(longPath);

      expect(result).toEqual(mockResponse);
      expect(mockCloudinaryUpload).toHaveBeenCalledWith(longPath, { resource_type: 'auto' });
    });

    test('should handle special characters in file path', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/test.jpg' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const specialPath = '/tmp/file with spaces & special-chars_123.jpg';
      await uploadOnCloudinary(specialPath);

      expect(mockCloudinaryUpload).toHaveBeenCalledWith(specialPath, { resource_type: 'auto' });
    });

    test('should handle files without extensions', async () => {
      const mockResponse = { public_id: 'test', secure_url: 'https://example.com/test' };
      mockCloudinaryUpload.mockResolvedValue(mockResponse);

      const result = await uploadOnCloudinary('/tmp/filenoextension');

      expect(result).toEqual(mockResponse);
    });
  });
});
