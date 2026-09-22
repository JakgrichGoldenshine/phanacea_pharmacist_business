const asyncHandler = require('../utils/asyncHandler');
const adminCategoryService = require('../services/adminCategoryService');

const list = asyncHandler(async (req, res) => {
  const data = await adminCategoryService.list();
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await adminCategoryService.create(req.body);
  res.status(201).json({ success: true, data });
});

module.exports = { list, create };
