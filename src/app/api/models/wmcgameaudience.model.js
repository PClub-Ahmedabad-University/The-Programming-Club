import mongoose from 'mongoose';

const wmcAudienceSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  treasure: {
    type: String, 
    required: true,
    trim: true
  },
  pairedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wmcUser',
    default: null
  },
    qrCode: {
        type: String, 
        default: null
    }, 
    retrys: {
        type: Number,
        default : 3
    },
}, {
  timestamps: true
});

export default mongoose.models.wmcAudience || mongoose.model('wmcAudience', wmcAudienceSchema);
