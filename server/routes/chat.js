const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../authMiddleware'); // Import the middleware

// Protect the routes with the middleware
router.post('/chat', authMiddleware, chatController.sendMessage);
router.get('/chat/history', authMiddleware, chatController.getChatHistory);

module.exports = router;