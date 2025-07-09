import mongoose from 'mongoose';

const ProblemSolveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    codeforcesHandle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminPostedProblem',
      required: true,
    },
    solvedAt: {
      type: Date,
      required: true,
    },
    submissionId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProblemSolveSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const ProblemSolve =
  mongoose.models.ProblemSolve ||
  mongoose.model('ProblemSolve', ProblemSolveSchema);

export default ProblemSolve;
