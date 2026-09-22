const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const adminStockService = require('../services/adminStockService');

const adjust = asyncHandler(async (req, res) => {
  const { product_id, movement_type, quantity_change, note } = req.body;
  if (!product_id || !movement_type || quantity_change === undefined) {
    throw new ApiError(400, 'กรุณาระบุสินค้า ประเภท และจำนวน', 'MISSING_FIELDS');
  }

  const result = await adminStockService.adjust({
    productId: product_id,
    staffId: req.staff.id,
    movementType: movement_type,
    quantityChange: quantity_change,
    note,
  });

  res.status(201).json({ success: true, data: result });
});

const movements = asyncHandler(async (req, res) => {
  const { product_id, page, limit } = req.query;
  const result = await adminStockService.listMovements({
    productId: product_id,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 30,
  });
  res.json({ success: true, ...result });
});

const lowStock = asyncHandler(async (req, res) => {
  const items = await adminStockService.lowStock();
  res.json({ success: true, data: items });
});

module.exports = { adjust, movements, lowStock };
