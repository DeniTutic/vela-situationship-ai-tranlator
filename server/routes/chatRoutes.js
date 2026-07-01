const express = require('express')
const router = express.Router()
const multer = require('multer')
const { protect } = require('../middleware/authMiddleware')
const { checkMessageLimit, checkPracticeLimit } = require('../middleware/rateLimitMiddleware')
const { createChat, getChats, getChatById, sendMessage, deleteChat, renameChat } = require('../controllers/chatController')
const Chat = require('../models/Chat')
const Message = require('../models/Message')
const User = require('../models/User')
const groq = require('../utils/groqClient')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.post('/new', protect, async (req, res, next) => {
  if (req.body.isPractice) return checkPracticeLimit(req, res, next)
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

router.post('/:id/upload-image', protect, checkMessageLimit, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' })

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    const base64Image = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`
    const caption = req.body.caption || ''

    // Save user message with image
    await Message.create({
      chatId: chat._id,
      role: 'user',
      content: caption || '📸 Shared a screenshot for analysis',
      imageUrl: imageDataUrl,
      inputType: 'image'
    })

    if (req.user.subscriptionStatus === 'free') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { messagesUsedToday: 1 } })
    }

    const userPrompt = caption
      ? `The user shared a screenshot and asked: "${caption}". Analyze the screenshot and answer their question directly and briefly.`
      : `Analyze this screenshot briefly. 2-4 sentences max. Be warm and direct.`

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageDataUrl } },
          { type: 'text', text: `You are Vela, a warm relationship clarity assistant. ${userPrompt}` }
        ]
      }],
      max_tokens: 512
    })

    const aiResponse = completion.choices[0].message.content

    const aiMessage = await Message.create({
      chatId: chat._id,
      role: 'assistant',
      content: aiResponse
    })

    await Chat.findByIdAndUpdate(chat._id, { updatedAt: new Date() })
    res.json({ message: aiMessage })
  } catch (err) {
    res.status(500).json({ message: 'Image analysis failed', error: err.message })
  }
})

module.exports = router