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
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
