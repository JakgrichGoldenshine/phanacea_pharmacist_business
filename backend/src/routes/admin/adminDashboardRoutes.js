const express = require('express');
const adminDashboardController = require('../../controllers/adminDashboardController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');

const router = express.Router();

router.get('/stats', requireStaffAuth, adminDashboardController.stats);

module.exports = router;
