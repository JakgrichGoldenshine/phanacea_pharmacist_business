const express = require('express');
const adminPosController = require('../../controllers/adminPosController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');

const router = express.Router();

router.use(requireStaffAuth);

router.get('/products', adminPosController.search);
router.get('/customers/lookup', adminPosController.lookupCustomer);
router.post('/checkout', adminPosController.checkout);

module.exports = router;
