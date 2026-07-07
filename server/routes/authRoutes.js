const express = require('express')
const router = express.Router()
const { signup, login, logout, getMe, verifyEmail, resendCode, forgotPassword, resetPassword } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const User = require('../models/User')
const { initiateGoogleAuth, googleCallback } = require('../controllers/googleAuthController');

router.get('/google', initiateGoogleAuth);
router.get('/google/callback', googleCallback);
router.post('/signup', signup)
router.post('/verify-email', verifyEmail)
router.post('/resend-code', resendCode)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.patch('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name },
      { new: true }
    ).select('-passwordHash')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' })
  }
})
router.patch('/onboarding', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update onboarding' })
  }
})

module.exports = router