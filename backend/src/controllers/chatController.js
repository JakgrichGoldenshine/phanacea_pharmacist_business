const asyncHandler = require('../utils/asyncHandler');
const chatService = require('../services/chatService');

const getChat = asyncHandler(async (req, res) => {
  const afterId = req.query.after ? Number(req.query.after) : null;
  const result = await chatService.getMyChat(req.user.id, Number.isInteger(afterId) ? afterId : null);
  res.json({ success: true, data: result });
});

const sendMessage = asyncHandler(async (req, res) => {
  const result = await chatService.sendMessage(req.user.id, req.body.message);
  res.status(201).json({ success: true, data: result });
});

module.exports = { getChat, sendMessage };
