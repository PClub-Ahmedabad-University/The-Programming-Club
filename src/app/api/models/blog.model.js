import mongoose from 'mongoose';
import commentSchema from './comment.model.js';
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
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  } 
}, {
  timestamps: true
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
