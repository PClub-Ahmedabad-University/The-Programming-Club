import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  author: {
    type: String,
    required: function () {
      return !this.isAnonymous;
    },
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
