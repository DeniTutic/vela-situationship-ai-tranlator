const User = require('../models/User');

const LIMITS = {
  free: { messages: 30, resetHours: 3 },
  plus: { messages: 150, resetHours: 24 },
  pro: { messages: 99999, resetHours: 24 }
}

const checkMessageLimit = async (req, res, next) => {
  try {
    const user = req.user
    const plan = user.subscriptionStatus || 'free'
    const limit = LIMITS[plan] || LIMITS.free

    const now = new Date()
    const resetAt = new Date(user.messagesResetAt)
    const hoursSinceReset = (now - resetAt) / (1000 * 60 * 60)

    if (hoursSinceReset >= limit.resetHours) {
      user.messagesUsedToday = 0
      user.messagesResetAt = now
      await user.save()
    }

    if (user.messagesUsedToday >= limit.messages) {
      const resetTime = new Date(resetAt.getTime() + limit.resetHours * 60 * 60 * 1000)
      const msUntilReset = resetTime - now
      return res.status(429).json({
        message: 'Message limit reached',
        limitReached: true,
        msUntilReset,
        plan
      })
    }

    next()
  } catch (err) {
    return res.status(500).json({ message: 'Rate limit check failed' })
  }
}

const checkPracticeLimit = async (req, res, next) => {
  try {
    const user = req.user
    const plan = user.subscriptionStatus || 'free'

    const practiceLimits = { free: 2, plus: 999, pro: 999 }
    const limit = practiceLimits[plan]

    if (user.practiceSessionsUsed >= limit) {
      return res.status(429).json({
        message: 'Practice limit reached',
        practiceLimit: true,
        plan
      })
    }

    next()
  } catch (err) {
    return res.status(500).json({ message: 'Practice limit check failed' })
  }
}

module.exports = { checkMessageLimit, checkPracticeLimit }