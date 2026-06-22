const User = require('../models/User');

const FREE_DAILY_LIMIT = 10;

const checkMessageLimit = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.subscriptionStatus === 'premium') return next();

    const now = new Date();
    const resetAt = new Date(user.messagesResetAt);
    const hoursSinceReset = (now - resetAt) / (1000 * 60 * 60);

    // Reset counter if 24h have passed
    if (hoursSinceReset >= 24) {
      user.messagesUsedToday = 0;
      user.messagesResetAt = now;
      await user.save();
    }

    if (user.messagesUsedToday >= FREE_DAILY_LIMIT) {
      return res.status(429).json({
        message: 'Daily limit reached. Upgrade to premium for unlimited messages.',
        limitReached: true
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Rate limit check failed' });
  }
};

module.exports = { checkMessageLimit };