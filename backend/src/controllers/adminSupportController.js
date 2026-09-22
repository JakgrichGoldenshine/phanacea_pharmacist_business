const asyncHandler = require('../utils/asyncHandler');
const adminSupportService = require('../services/adminSupportService');

const list = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await adminSupportService.listTickets({
    status,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 30,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const ticket = await adminSupportService.getTicket(req.params.id);
  res.json({ success: true, data: ticket });
});

const addMessage = asyncHandler(async (req, res) => {
  const message = await adminSupportService.addStaffMessage(req.params.id, req.staff.id, req.body.message);
  res.status(201).json({ success: true, data: message });
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await adminSupportService.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, data: result });
});

module.exports = { list, getOne, addMessage, updateStatus };
