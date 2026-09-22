const express = require('express');
const adminSupportController = require('../../controllers/adminSupportController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');
const { supportLimiter } = require('../../middlewares/rateLimiters');

const router = express.Router();

router.use(requireStaffAuth);
router.use(requireRole('owner', 'pharmacist', 'assistant')); // 'staff' role is order-management only

router.get('/', adminSupportController.list);
router.get('/:id', adminSupportController.getOne);
router.post('/:id/messages', supportLimiter, adminSupportController.addMessage);
router.patch('/:id/status', adminSupportController.updateStatus);

module.exports = router;
