const asyncHandler = require('../utils/asyncHandler');
const adminProductService = require('../services/adminProductService');

const list = asyncHandler(async (req, res) => {
  const { search, category, page, limit } = req.query;
  const result = await adminProductService.listAll({
    search,
    categoryId: category,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await adminProductService.getById(req.params.id);
  res.json({ success: true, data: product });
});

const create = asyncHandler(async (req, res) => {
  const product = await adminProductService.create({ ...req.body, staffId: req.staff.id });
  res.status(201).json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await adminProductService.update(req.params.id, req.body);
  res.json({ success: true, data: product });
});

const remove = asyncHandler(async (req, res) => {
  const result = await adminProductService.deactivate(req.params.id);
  res.json({ success: true, data: result });
});

const getMeta = asyncHandler(async (req, res) => {
  const data = await adminProductService.getMeta();
  res.json({ success: true, data });
});

module.exports = { list, getOne, create, update, remove, getMeta };
