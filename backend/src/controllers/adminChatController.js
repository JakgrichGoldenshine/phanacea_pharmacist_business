const asyncHandler = require('../utils/asyncHandler');
const adminChatService = require('../services/adminChatService');

const list = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await adminChatService.listConversations({
    status,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 30,
  });
  res.json({ success: true, ...result });
});

const waitingCount = asyncHandler(async (req, res) => {
  const count = await adminChatService.countWaiting();
  res.json({ success: true, data: { waiting: count } });
});

const getOne = asyncHandler(async (req, res) => {
  const afterId = req.query.after ? Number(req.query.after) : null;
  const result = await adminChatService.getConversation(
    req.params.id,
    Number.isInteger(afterId) ? afterId : null
  );
  res.json({ success: true, data: result });
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await adminChatService.sendMessage(req.params.id, req.staff.id, req.body.message);
  res.status(201).json({ success: true, data: message });
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await adminChatService.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, data: result });
});

module.exports = { list, waitingCount, getOne, sendMessage, updateStatus };
