const express = require('express')
const router = express.Router()
const { getVoiceStatus, startVoiceSession } = require('../controllers/voiceController')
const { protect } = require('../middleware/authMiddleware')

router.get('/status', protect, getVoiceStatus)
router.post('/start-session', protect, startVoiceSession)

module.exports = router