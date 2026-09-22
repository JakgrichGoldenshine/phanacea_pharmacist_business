const asyncHandler = require('../utils/asyncHandler');
const adminSupplierService = require('../services/adminSupplierService');

const list = asyncHandler(async (req, res) => {
  const data = await adminSupplierService.list();
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await adminSupplierService.create(req.body);
  res.status(201).json({ success: true, data });
});

module.exports = { list, create };
