// this is a participant user modal for the wmc game 
// src/models/wmcUser.js
import mongoose from 'mongoose';

const wmcUserSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  treasure: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
    // enum: ['student','admin','owner']
  }, 
      qrCode: {
        type: String, 
        default: null
    }
}, {
  timestamps: true
});

export default mongoose.models.wmcUser || mongoose.model('wmcUser', wmcUserSchema);
