const express = require('express');
const adminChatController = require('../../controllers/adminChatController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');
const { chatLimiter } = require('../../middlewares/rateLimiters');

const router = express.Router();

router.use(requireStaffAuth);

// Deliberately open to EVERY staff role, unlike the ticket inbox. Live
// chat is front-desk work — answering "is this in stock?" is the same job
// whoever is at the counter. Ticket triage stays restricted because it
// carries case metadata (category, resolution state) used for QA.
router.get('/', adminChatController.list);
router.get('/waiting-count', adminChatController.waitingCount);
router.get('/:id', adminChatController.getOne);
router.post('/:id/messages', chatLimiter, adminChatController.sendMessage);

// Closing or resolving a conversation is a supervisory action, so it keeps
// the same role gate as the ticket inbox.
router.patch('/:id/status', requireRole('owner', 'pharmacist', 'assistant'), adminChatController.updateStatus);

module.exports = router;
