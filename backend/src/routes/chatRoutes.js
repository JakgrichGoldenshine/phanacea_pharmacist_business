const express = require('express');
const chatController = require('../controllers/chatController');
const { chatLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

// Mounted under /api/support/chat, which already applies requireAuth —
// a chat always belongs to a known customer.
//
// Reads are intentionally NOT rate-limited beyond the global API limiter:
// the page polls this endpoint, and throttling it would make the chat
// appear to freeze. Writes get their own tighter limiter.
router.get('/', chatController.getChat);
router.post('/messages', chatLimiter, chatController.sendMessage);

module.exports = router;
