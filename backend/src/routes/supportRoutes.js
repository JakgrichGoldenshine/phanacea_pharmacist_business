const express = require('express');
const supportController = require('../controllers/supportController');
const chatRoutes = require('./chatRoutes');
const requireAuth = require('../middlewares/requireAuth');
const { supportLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

router.use(requireAuth); // every support action is tied to a known customer — req.user must exist before the limiter keys on it

// Live chat lives under /support/chat. Mounted BEFORE the '/:id' route
// below, otherwise Express would match the literal word "chat" as a
// ticket id and answer 404.
router.use('/chat', chatRoutes);

router.get('/', supportController.list);
router.post('/', supportLimiter, supportController.create);
router.get('/:id', supportController.getOne);
router.post('/:id/messages', supportLimiter, supportController.addMessage);

module.exports = router;
