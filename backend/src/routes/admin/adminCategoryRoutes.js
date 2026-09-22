const express = require('express');
const adminCategoryController = require('../../controllers/adminCategoryController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(requireStaffAuth);
router.use(requireRole('owner', 'pharmacist', 'assistant')); // 'staff' role is order-management only

router.get('/', adminCategoryController.list);
router.post('/', adminCategoryController.create);

module.exports = router;
