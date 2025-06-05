const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  term: {
    type: String,
    required: true,
    trim: true,
  },
  linkedinId: {
    type: String,
    required: false,
    trim: true,
  },
  pfpImage: {
    type: String,
    required: false,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);