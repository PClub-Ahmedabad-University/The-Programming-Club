import connectDB from "../lib/db";
import cloudinary from "../lib/cloudinary";
import Gallery from "../models/gallery.model";
//-------------------------------------------------------------
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
        folder: 'gallery',
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
//-------------------------------------------------------------
export const updateEventGallery = async (req, id) => {
  await connectDB();
  const data = await req.json();
  const { eventName, newImages = [], removeImageUrls = [] } = data;
  if (!id) throw new Error("galleryId is required");
  const gallery = await Gallery.findById(id);
  if (!gallery) throw new Error("Gallery not found");
  let uploadedUrls = [];
  if (newImages.length) {
    const uploadResults = await Promise.all(
      newImages.map((img, idx) =>
        cloudinary.uploader.upload(img, {
          folder: "events",
          public_id: `${id}_${Date.now()}_${idx}`,
        })
      )
    );
    uploadedUrls = uploadResults.map((r) => r.secure_url);
  }
  const remainingUrls = gallery.imageUrls.filter((url) => !removeImageUrls.includes(url));
  const finalUrls = [...remainingUrls, ...uploadedUrls];
  if (eventName) gallery.eventName = eventName;
  gallery.imageUrls = finalUrls;
  await gallery.save();
  return gallery;
}
//-------------------------------------------------------------
export const deleteEventGallery = async(_req, id) => {
  await connectDB();
  const deletedGallery = await Gallery.findByIdAndDelete(id);
  if(deletedGallery===null) {
      throw new Error("Gallery not found");
  }
  return deletedGallery;
}