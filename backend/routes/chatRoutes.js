const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes protected with JWT
router.get('/', protect, getChatHistory);
router.post('/', protect, saveChatMessage);
router.delete('/', protect, clearChatHistory);

module.exports = router;

