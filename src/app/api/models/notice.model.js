import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  show: { type: Boolean, default: true },
  link: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);