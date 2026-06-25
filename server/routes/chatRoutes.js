const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkMessageLimit } = require('../middleware/rateLimitMiddleware');
const { createChat, getChats, getChatById, sendMessage, deleteChat, renameChat } = require('../controllers/chatController');

router.post('/new', protect, createChat);
router.get('/', protect, getChats);
router.get('/:id', protect, getChatById);
router.post('/:id/message', protect, checkMessageLimit, sendMessage);
router.delete('/:id', protect, deleteChat);
router.patch('/:id/title', protect, renameChat);

module.exports = router;