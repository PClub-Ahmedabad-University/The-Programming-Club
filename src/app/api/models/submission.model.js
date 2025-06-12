import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({}, { strict: false });

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
