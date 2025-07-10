import mongoose from 'mongoose';

const problemSolveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    codeforcesHandle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CPProblem',
      required: true
    },
    solvedAt: {
      type: Date,
      required: true
    },
    submissionId: {
      type: String, 
      required: true
    },
    verdict: {
      type: String,
      enum: [
        'OK',
        'WRONG_ANSWER',
        'TIME_LIMIT_EXCEEDED',
        'RUNTIME_ERROR',
        'COMPILATION_ERROR',
        'MEMORY_LIMIT_EXCEEDED',
        'CHALLENGED',
        'SKIPPED',
        'IDLENESS_LIMIT_EXCEEDED',
        'PARTIAL',
        'TESTING',
        'REJECTED',
        'FAILED'
      ],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.ProblemSolve ||
  mongoose.model('ProblemSolve', problemSolveSchema);
