const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middlewares/requireAuth');
const requireDemoLoginEnabled = require('../middlewares/requireDemoLoginEnabled');
const { loginLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

router.post('/register', loginLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
// 404s unless DEMO_LOGIN_ENABLED=true — see requireDemoLoginEnabled.
router.post('/demo-login', requireDemoLoginEnabled, loginLimiter, authController.demoLogin);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
