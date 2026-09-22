const express = require('express');
const adminSalesController = require('../../controllers/adminSalesController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');

const router = express.Router();

router.use(requireStaffAuth);

router.get('/', adminSalesController.list);
router.get('/:id', adminSalesController.getOne);
router.patch('/:id/status', adminSalesController.updateStatus);

module.exports = router;
