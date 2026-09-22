const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const adminSalesService = require('../services/adminSalesService');

const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await adminSalesService.listSales({
    status,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const sale = await adminSalesService.getSaleById(req.params.id);
  res.json({ success: true, data: sale });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new ApiError(400, 'กรุณาระบุสถานะ', 'MISSING_FIELDS');
  const result = await adminSalesService.updateStatus(req.params.id, status);
  res.json({ success: true, data: result });
});

module.exports = { list, getOne, updateStatus };
