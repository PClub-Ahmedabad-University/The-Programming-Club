import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema(
  {
    formId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Form', 
      required: true 
    },
    title: {
      type: String,
      required: false // Made optional since we'll add it from the form
    },
    responses: { 
      type: Map, 
      of: mongoose.Schema.Types.Mixed, 
      default: {}
    },
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

const FormSubmission = mongoose.models.FormSubmission ||
  mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;
