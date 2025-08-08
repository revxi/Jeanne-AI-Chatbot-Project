const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat
router.post('/chat', chatController.sendMessage);
// GET /api/chat/history
router.get('/chat/history', chatController.getChatHistory);

module.exports = router;
