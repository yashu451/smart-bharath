const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
  sendChatMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes protected with JWT
router.get('/', protect, getChatHistory);
router.post('/', protect, saveChatMessage);
router.post('/message', protect, sendChatMessage);
router.post('/complete', protect, sendChatMessage);
router.post('/generate', protect, sendChatMessage);
router.delete('/', protect, clearChatHistory);

module.exports = router;

