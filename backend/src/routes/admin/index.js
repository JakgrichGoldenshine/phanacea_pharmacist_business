const express = require('express');
const staffAuthRoutes = require('./staffAuthRoutes');
const adminProductRoutes = require('./adminProductRoutes');
const adminStockRoutes = require('./adminStockRoutes');
const adminSalesRoutes = require('./adminSalesRoutes');
const adminDashboardRoutes = require('./adminDashboardRoutes');
const adminCategoryRoutes = require('./adminCategoryRoutes');
const adminPosRoutes = require('./adminPosRoutes');
const adminSupportRoutes = require('./adminSupportRoutes');
const adminChatRoutes = require('./adminChatRoutes');
const adminStaffRoutes = require('./adminStaffRoutes');
const adminSupplierRoutes = require('./adminSupplierRoutes');
const adminShipmentRoutes = require('./adminShipmentRoutes');

const router = express.Router();

// Each sub-router owns exactly one responsibility (auth / products / stock
// / sales / dashboard / categories / POS / support / live chat / staff
// accounts / suppliers / shipments) — none of them reach into another
// domain's table directly.
router.use('/auth', staffAuthRoutes);
router.use('/products', adminProductRoutes);
router.use('/stock', adminStockRoutes);
router.use('/sales', adminSalesRoutes);
router.use('/dashboard', adminDashboardRoutes);
router.use('/categories', adminCategoryRoutes);
router.use('/pos', adminPosRoutes);
router.use('/support', adminSupportRoutes);
router.use('/chat', adminChatRoutes);
router.use('/staff', adminStaffRoutes);
router.use('/suppliers', adminSupplierRoutes);
router.use('/shipments', adminShipmentRoutes);

module.exports = router;
