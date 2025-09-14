const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: { type: Object, required: false },
  type: { type: String, enum: ['file', 'folder'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'file', default: null },
  fileId: { type: mongoose.Schema.Types.ObjectId, default: null }, 
  mimeType: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.model("File", FileSchema);
