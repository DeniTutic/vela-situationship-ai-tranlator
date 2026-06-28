const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { checkMessageLimit, checkPracticeLimit } = require('../middleware/rateLimitMiddleware')
const { createChat, getChats, getChatById, sendMessage, deleteChat, renameChat } = require('../controllers/chatController')
const Chat = require('../models/Chat')
const User = require('../models/User')

router.post('/new', protect, async (req, res, next) => {
  if (req.body.isPractice) {
    return checkPracticeLimit(req, res, next)
  }
  next()
}, createChat)

router.get('/', protect, getChats)
router.get('/:id', protect, getChatById)
router.post('/:id/message', protect, checkMessageLimit, sendMessage)
router.delete('/:id', protect, deleteChat)
router.patch('/:id/title', protect, renameChat)
router.patch('/:id/style', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { responseStyle: req.body.responseStyle },
      { new: true }
    )
    res.json(chat)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update style' })
  }
})

module.exports = router