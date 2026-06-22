const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  responseStyle: {
    type: String,
    enum: ['gentle', 'analytical', 'brutal', 'hype', 'therapist'],
    default: 'gentle'
  },
  isPractice: { type: Boolean, default: false },
  practiceTarget: { type: String, default: '' }, // e.g. "my ex", "my crush"
  practiceMode: { type: String, enum: ['easy', 'realistic', 'hard', 'worst'], default: 'realistic' },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);