const express = require('express');
const staffAuthController = require('../../controllers/staffAuthController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const { loginLimiter } = require('../../middlewares/rateLimiters');

const router = express.Router();

router.post('/login', loginLimiter, staffAuthController.login);
router.post('/logout', requireStaffAuth, staffAuthController.logout);
router.get('/me', requireStaffAuth, staffAuthController.me);

module.exports = router;
