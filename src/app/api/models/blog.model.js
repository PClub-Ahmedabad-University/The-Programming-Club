import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    required: function () {
      return !this.isAnonymous;
    },
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: { 
    type: String,
    required: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  },
  comments: [commentSchema] 
}, {
  timestamps: true
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
