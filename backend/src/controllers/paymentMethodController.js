const asyncHandler = require('../utils/asyncHandler');
const paymentMethodService = require('../services/paymentMethodService');

const list = asyncHandler(async (req, res) => {
  const methods = await paymentMethodService.listActiveMethods();
  res.json({ success: true, data: methods });
});

module.exports = { list };
