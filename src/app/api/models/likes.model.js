import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    blogId: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Add compound index to prevent duplicate likes
likeSchema.index({ blogId: 1, userId: 1 }, { unique: true });

// Handle duplicate key error
likeSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Duplicate like detected'));
    } else {
        next(error);
    }
});

export default mongoose.models.Like || mongoose.model("Like", likeSchema);
