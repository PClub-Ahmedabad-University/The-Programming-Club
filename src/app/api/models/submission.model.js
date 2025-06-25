import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema(
  {
    formId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Form', 
      required: true,
      index: true
    },
    userId: {
      type: String,  
      required: true,
      index: true
    },
    title: {
      type: String,
      required: false 
    },
    responses: [{
      question: {
        type: String,
        required: true
      },
      answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      fieldType: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      _id: false
    }],
    submittedAt: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['pending', 'submitted', 'reviewed'], 
      default: 'submitted' 
    },
    metadata: {
      userAgent: String,
      ip: String,
      formTitle: String,
      referrer: String
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual for form reference
formSubmissionSchema.virtual('form', {
  ref: 'Form',
  localField: 'formId',
  foreignField: '_id',
  justOne: true
});

// Add compound index to ensure one submission per user per form
formSubmissionSchema.index({ formId: 1, userId: 1 }, { unique: true });

const FormSubmission = mongoose.models.FormSubmission ||
  mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;
