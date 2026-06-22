const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  inputType: { type: String, enum: ['text', 'voice', 'image', 'pdf'], default: 'text' },
  attachments: [{ type: String }], // Cloudinary URLs
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);