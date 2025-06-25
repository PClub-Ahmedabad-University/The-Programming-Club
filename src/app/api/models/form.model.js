import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

// Define field schema
const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'textarea', 'file', 'radio', 'checkbox', 'select'],
    default: 'text',
    required: true
  },
  required: { type: Boolean, default: false },
  isEvent: { type: Boolean, default: false },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  options: {
    type: [optionSchema],
    required: function() {
      return ['radio', 'checkbox', 'select'].includes(this.type);
    },
    default: undefined
  },
  rows: {
    type: Number,
    default: 3
  },
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fields: [fieldSchema],
    state: { 
      type: String, 
      enum: ['open', 'closed'],
      default: 'closed',
      required: true 
    },
    isEvent: {
      type: Boolean,
      default: false
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null
    }
  },
  { timestamps: true }
);

const Form = mongoose.models.Form || mongoose.model('Form', formSchema);
export default Form;
