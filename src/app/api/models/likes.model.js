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
},{timestamps:true});

export default mongoose.models.Like || mongoose.model("Like", likeSchema);
