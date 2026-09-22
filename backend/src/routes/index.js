const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const paymentMethodRoutes = require('./paymentMethodRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const orderRoutes = require('./orderRoutes');
const supportRoutes = require('./supportRoutes');
const adminRoutes = require('./admin');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'PHANACEA API is running' }));

// Customer-facing surface
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/support', supportRoutes);

// Back-office surface — fully separate auth (staff, not users) and its
// own set of single-responsibility sub-routers (see routes/admin/index.js)
router.use('/admin', adminRoutes);

module.exports = router;
