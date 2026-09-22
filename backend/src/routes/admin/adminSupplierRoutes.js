const express = require('express');
const adminSupplierController = require('../../controllers/adminSupplierController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(requireStaffAuth);
router.use(requireRole('owner', 'pharmacist', 'assistant')); // 'staff' role is order-management only

router.get('/', adminSupplierController.list);
router.post('/', adminSupplierController.create);

module.exports = router;
