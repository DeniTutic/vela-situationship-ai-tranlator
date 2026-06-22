const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder — we'll fill this in next step
router.get('/', protect, (req, res) => {
  res.json({ message: 'Chat routes coming soon' });
});

module.exports = router;