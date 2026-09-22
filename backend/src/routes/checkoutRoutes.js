const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.post('/', requireAuth, checkoutController.checkout);

module.exports = router;
