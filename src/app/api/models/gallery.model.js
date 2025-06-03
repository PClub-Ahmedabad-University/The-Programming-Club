import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
}, { timestamps: true });
const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

export default Gallery;
