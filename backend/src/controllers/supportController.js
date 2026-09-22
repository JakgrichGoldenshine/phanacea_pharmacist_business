const asyncHandler = require('../utils/asyncHandler');
const supportService = require('../services/supportService');

const create = asyncHandler(async (req, res) => {
  const ticket = await supportService.createTicket({ userId: req.user.id, ...req.body });
  res.status(201).json({ success: true, data: ticket });
});

const list = asyncHandler(async (req, res) => {
  const tickets = await supportService.listMyTickets(req.user.id);
  res.json({ success: true, data: tickets });
});

const getOne = asyncHandler(async (req, res) => {
  const ticket = await supportService.getMyTicket(req.user.id, req.params.id);
  res.json({ success: true, data: ticket });
});

const addMessage = asyncHandler(async (req, res) => {
  const message = await supportService.addMyMessage(req.user.id, req.params.id, req.body.message);
  res.status(201).json({ success: true, data: message });
});

module.exports = { create, list, getOne, addMessage };
