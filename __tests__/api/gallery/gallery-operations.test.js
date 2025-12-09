import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Gallery from '../../../src/app/api/models/gallery.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testDb.js';

describe('Gallery API - Gallery Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/gallery/add - Add Gallery', () => {
    test('should create gallery with event name and images', async () => {
      const galleryData = {
        eventName: 'Tech Fest 2025',
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      };

      const gallery = await Gallery.create(galleryData);
      expect(gallery._id).toBeDefined();
      expect(gallery.eventName).toBe('Tech Fest 2025');
      expect(gallery.imageUrls).toHaveLength(2);
      expect(gallery.imageUrls[0]).toBe('https://example.com/image1.jpg');
    });

    test('should fail without required eventName', async () => {
      const galleryData = {
        imageUrls: ['https://example.com/image1.jpg'],
      };

      await expect(Gallery.create(galleryData)).rejects.toThrow();
    });

    test('should allow single image', async () => {
      const galleryData = {
        eventName: 'Single Image Event',
        imageUrls: ['https://example.com/single.jpg'],
      };

      const gallery = await Gallery.create(galleryData);
      expect(gallery.imageUrls).toHaveLength(1);
    });

    test('should allow multiple images', async () => {
      const imageUrls = Array.from({ length: 10 }, (_, i) => 
        `https://example.com/image${i + 1}.jpg`
      );

      const galleryData = {
        eventName: 'Multi Image Event',
        imageUrls: imageUrls,
      };

      const gallery = await Gallery.create(galleryData);
      expect(gallery.imageUrls).toHaveLength(10);
    });

    test('should have timestamps', async () => {
      const gallery = await Gallery.create({
        eventName: 'Test Event',
        imageUrls: ['https://example.com/test.jpg'],
      });

      expect(gallery.createdAt).toBeDefined();
      expect(gallery.updatedAt).toBeDefined();
      expect(gallery.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/gallery/get - Get All Galleries', () => {
    test('should return empty array when no galleries exist', async () => {
      const galleries = await Gallery.find({});
      expect(Array.isArray(galleries)).toBe(true);
      expect(galleries).toHaveLength(0);
    });

    test('should return all galleries', async () => {
      await Gallery.create({
        eventName: 'Event 1',
        imageUrls: ['https://example.com/1.jpg'],
      });
      await Gallery.create({
        eventName: 'Event 2',
        imageUrls: ['https://example.com/2.jpg'],
      });

      const galleries = await Gallery.find({});
      expect(galleries).toHaveLength(2);
    });

    test('should find gallery by eventName', async () => {
      await Gallery.create({
        eventName: 'Unique Event',
        imageUrls: ['https://example.com/unique.jpg'],
      });

      const gallery = await Gallery.findOne({ eventName: 'Unique Event' });
      expect(gallery).toBeDefined();
      expect(gallery.eventName).toBe('Unique Event');
    });

    test('should sort galleries by creation date', async () => {
      const gallery1 = await Gallery.create({
        eventName: 'First',
        imageUrls: ['https://example.com/1.jpg'],
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const gallery2 = await Gallery.create({
        eventName: 'Second',
        imageUrls: ['https://example.com/2.jpg'],
      });

      const galleries = await Gallery.find({}).sort({ createdAt: 1 });
      expect(galleries[0].eventName).toBe('First');
      expect(galleries[1].eventName).toBe('Second');
    });
  });

  describe('PATCH /api/gallery/patch/[id] - Update Gallery', () => {
    test('should update gallery event name', async () => {
      const gallery = await Gallery.create({
        eventName: 'Old Event Name',
        imageUrls: ['https://example.com/image.jpg'],
      });

      const updated = await Gallery.findByIdAndUpdate(
        gallery._id,
        { eventName: 'New Event Name' },
        { new: true }
      );

      expect(updated.eventName).toBe('New Event Name');
    });

    test('should update gallery images', async () => {
      const gallery = await Gallery.create({
        eventName: 'Test Event',
        imageUrls: ['https://example.com/old.jpg'],
      });

      const updated = await Gallery.findByIdAndUpdate(
        gallery._id,
        { imageUrls: ['https://example.com/new1.jpg', 'https://example.com/new2.jpg'] },
        { new: true }
      );

      expect(updated.imageUrls).toHaveLength(2);
      expect(updated.imageUrls[0]).toBe('https://example.com/new1.jpg');
    });

    test('should add images to existing gallery', async () => {
      const gallery = await Gallery.create({
        eventName: 'Test Event',
        imageUrls: ['https://example.com/1.jpg'],
      });

      const updated = await Gallery.findByIdAndUpdate(
        gallery._id,
        { $push: { imageUrls: 'https://example.com/2.jpg' } },
        { new: true }
      );

      expect(updated.imageUrls).toHaveLength(2);
    });
  });

  describe('DELETE /api/gallery/delete/[id] - Delete Gallery', () => {
    test('should delete gallery successfully', async () => {
      const gallery = await Gallery.create({
        eventName: 'To Be Deleted',
        imageUrls: ['https://example.com/delete.jpg'],
      });

      await Gallery.findByIdAndDelete(gallery._id);

      const found = await Gallery.findById(gallery._id);
      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent gallery', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await Gallery.findByIdAndDelete(fakeId);
      expect(result).toBeNull();
    });
  });

  describe('Gallery Data Validation', () => {
    test('should handle empty imageUrls array', async () => {
      const galleryData = {
        eventName: 'Empty Gallery',
        imageUrls: [],
      };

      const gallery = await Gallery.create(galleryData);
      expect(gallery.imageUrls).toHaveLength(0);
    });

    test('should handle special characters in event name', async () => {
      const gallery = await Gallery.create({
        eventName: 'Event @ 2025 - Tech Fest!',
        imageUrls: ['https://example.com/test.jpg'],
      });

      expect(gallery.eventName).toBe('Event @ 2025 - Tech Fest!');
    });

    test('should handle long event names', async () => {
      const longName = 'A'.repeat(200);
      const gallery = await Gallery.create({
        eventName: longName,
        imageUrls: ['https://example.com/test.jpg'],
      });

      expect(gallery.eventName.length).toBe(200);
    });
  });
});
