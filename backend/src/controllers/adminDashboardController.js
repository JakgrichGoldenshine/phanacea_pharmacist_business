const asyncHandler = require('../utils/asyncHandler');
const adminDashboardService = require('../services/adminDashboardService');

const stats = asyncHandler(async (req, res) => {
  const data = await adminDashboardService.getStats();
  res.json({ success: true, data });
});

module.exports = { stats };
