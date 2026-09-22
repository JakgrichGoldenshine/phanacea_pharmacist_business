const express = require('express');
const adminShipmentController = require('../../controllers/adminShipmentController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(requireStaffAuth);
router.use(requireRole('owner', 'pharmacist', 'assistant')); // 'staff' role is order-management only

router.get('/', adminShipmentController.list);
router.get('/:id', adminShipmentController.getOne);
router.post('/', adminShipmentController.create);

module.exports = router;
