const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../authMiddleware'); // Import the middleware

// Apply the middleware to all routes in this file
router.use(authMiddleware);

router.post('/', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);

module.exports = router;