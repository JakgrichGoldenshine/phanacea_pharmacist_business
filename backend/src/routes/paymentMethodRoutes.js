const express = require('express');
const paymentMethodController = require('../controllers/paymentMethodController');

const router = express.Router();

// Public: the checkout screen needs this before the customer has decided
// anything, and the list contains no sensitive data.
router.get('/', paymentMethodController.list);

module.exports = router;
