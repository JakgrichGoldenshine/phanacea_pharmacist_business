const asyncHandler = require('../utils/asyncHandler');
const adminShipmentService = require('../services/adminShipmentService');

const list = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await adminShipmentService.list({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const shipment = await adminShipmentService.getById(req.params.id);
  res.json({ success: true, data: shipment });
});

const create = asyncHandler(async (req, res) => {
  const { supplier_id, note, items } = req.body;
  const shipment = await adminShipmentService.create({
    supplierId: supplier_id,
    staffId: req.staff.id,
    note,
    items,
  });
  res.status(201).json({ success: true, data: shipment });
});

module.exports = { list, getOne, create };
