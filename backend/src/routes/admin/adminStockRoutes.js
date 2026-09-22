const express = require('express');
const adminStockController = require('../../controllers/adminStockController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(requireStaffAuth);
router.use(requireRole('owner', 'pharmacist', 'assistant')); // 'staff' role is order-management only

router.get('/movements', adminStockController.movements);
router.get('/low-stock', adminStockController.lowStock);
router.post('/adjust', adminStockController.adjust);

module.exports = router;
