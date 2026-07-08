const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: {
    type: String,
    required: function () { return !this.googleId; }
  },
  googleId: { type: String, unique: true, sparse: true, default: null },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  avatar: { type: String, default: '' },
  language: { type: String, enum: ['en', 'bs'], default: 'en' },
  subscriptionStatus: { type: String, enum: ['free', 'plus', 'pro'], default: 'free' },
  subscriptionExpiry: { type: Date, default: null },
  messagesUsedToday: { type: Number, default: 0 },
  messagesResetAt: { type: Date, default: Date.now },
  practiceSessionsUsed: { type: Number, default: 0 },
  defaultResponseStyle: {
    type: String,
    enum: ['gentle', 'analytical', 'brutal', 'hype', 'therapist'],
    default: 'gentle'
  },
  historySummary: { type: String, default: '' },
  historySummaryUpdatedAt: { type: Date, default: null },
  onboardingCompleted: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationCodeExpiry: { type: Date, default: null },
  passwordResetCode: { type: String, default: null },
  passwordResetCodeExpiry: { type: Date, default: null },
  voiceSessionsUsedToday: { type: Number, default: 0 },
  voiceSessionsResetAt: { type: Date, default: Date.now },
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);