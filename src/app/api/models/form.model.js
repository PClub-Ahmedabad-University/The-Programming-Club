import mongoose from 'mongoose';

        // Define field schema
const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'textarea', 'file'],
    default: 'text',
    required: true
  },
  required: { type: Boolean, default: false }
});

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fields: [fieldSchema]
  },
  { timestamps: true }
);

const Form = mongoose.models.Form || mongoose.model('Form', formSchema);
export default Form;
