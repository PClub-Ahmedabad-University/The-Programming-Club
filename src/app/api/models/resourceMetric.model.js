import mongoose from 'mongoose';

const resourceMetricSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stars: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ResourceMetric || mongoose.model('ResourceMetric', resourceMetricSchema);
