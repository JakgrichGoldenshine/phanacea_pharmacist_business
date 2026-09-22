const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const list = asyncHandler(async (req, res) => {
  const orders = await orderService.listMyOrders(req.user.id);
  res.json({ success: true, data: orders });
});

const getOne = asyncHandler(async (req, res) => {
  const order = await orderService.getMyOrderById(req.user.id, req.params.id);
  res.json({ success: true, data: order });
});

module.exports = { list, getOne };
