const express = require('express')
const router = express.Router()
const { signup, login, logout, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const User = require('../models/User')

router.post('/signup', signup)
router.post('/login', login)
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

module.exports = router