import connectDB from "../lib/db";
import cloudinary from "../lib/cloudinary";
import Gallery from "../models/gallery.model";
export const addEventGallery = async (req) => {
  await connectDB();
  const data = await req.json();
  const { eventName, images } = data;
  if (!eventName || !Array.isArray(images) || images.length === 0) {
    throw new Error('Invalid input: eventName must be a string and images must be a non-empty array of base64 strings.');
  }
  const uploadedUrls = [];
  for (const image of images) {
    try {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'events',
        resource_type: 'image',
      });
      uploadedUrls.push(uploadRes.secure_url);
    } catch (err) {
      console.error('Image upload failed:', err);
      throw new Error('Failed to upload one or more images');
    }
  }
  console.log(uploadedUrls);
  const newEntry = await Gallery.create({
    eventName,
    imageUrls: uploadedUrls,
  });
  return newEntry;
};