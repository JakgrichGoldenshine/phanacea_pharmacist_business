const express = require('express');
const adminProductController = require('../../controllers/adminProductController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(requireStaffAuth); // every route below requires a staff session
router.use(requireRole('owner', 'pharmacist', 'assistant')); // 'staff' role is order-management only

router.get('/meta/options', adminProductController.getMeta);
router.get('/', adminProductController.list);
router.get('/:id', adminProductController.getOne);
router.post('/', adminProductController.create);
router.put('/:id', adminProductController.update);
router.delete('/:id', requireRole('owner'), adminProductController.remove);

module.exports = router;
