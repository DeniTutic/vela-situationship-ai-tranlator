const User = require('../models/User');

const VOICE_LIMITS = { free: 0, plus: 5, pro: 15 };
const RESET_WINDOW_MS = 24 * 60 * 60 * 1000;

const getLimit = (tier) => VOICE_LIMITS[tier] ?? 0;

const maybeReset = (user) => {
  const elapsed = Date.now() - new Date(user.voiceSessionsResetAt).getTime();
  if (elapsed > RESET_WINDOW_MS) {
    user.voiceSessionsUsedToday = 0;
    user.voiceSessionsResetAt = new Date();
  }
};

// @GET /api/voice/status
// Check remaining sessions without consuming one
const getVoiceStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    maybeReset(user);
    await user.save();

    const limit = getLimit(user.subscriptionStatus);
    const remaining = Math.max(0, limit - user.voiceSessionsUsedToday);

    res.json({
      allowed: remaining > 0,
      remaining,
      limit,
      resetAt: user.voiceSessionsResetAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check voice status' });
  }
};

// @POST /api/voice/start-session
// Consumes one session if allowed
const startVoiceSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    maybeReset(user);

    const limit = getLimit(user.subscriptionStatus);
    const remaining = limit - user.voiceSessionsUsedToday;

    if (remaining <= 0) {
      await user.save();
      return res.status(403).json({
        message: user.subscriptionStatus === 'free'
          ? 'Voice conversations are available on Vela+ and VelaPro'
          : 'You\'ve used all your voice sessions for today',
        allowed: false,
        remaining: 0,
        limit,
        resetAt: user.voiceSessionsResetAt
      });
    }

    user.voiceSessionsUsedToday += 1;
    await user.save();

    res.json({
      allowed: true,
      remaining: limit - user.voiceSessionsUsedToday,
      limit,
      resetAt: user.voiceSessionsResetAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start voice session' });
  }
};

module.exports = { getVoiceStatus, startVoiceSession };