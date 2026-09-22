const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const checkoutService = require('../services/checkoutService');

const MAX_LINES = 50;

const checkout = asyncHandler(async (req, res) => {
  const { payment_method_id: paymentMethodId, items, note } = req.body;

  if (!paymentMethodId) {
    throw new ApiError(400, 'กรุณาเลือกช่องทางการชำระเงิน', 'MISSING_PAYMENT_METHOD');
  }

  // Shape-check the cart here so the service layer can assume a clean
  // payload and the customer gets a specific message instead of a
  // database error leaking through.
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'ตะกร้าสินค้าว่างเปล่า', 'EMPTY_CART');
  }
  if (items.length > MAX_LINES) {
    throw new ApiError(400, `สั่งซื้อได้สูงสุด ${MAX_LINES} รายการต่อหนึ่งคำสั่งซื้อ`, 'TOO_MANY_ITEMS');
  }
  const malformed = items.some(
    (i) => !i || !Number.isInteger(Number(i.product_id)) || !Number.isInteger(Number(i.quantity)) || Number(i.quantity) < 1
  );
  if (malformed) {
    throw new ApiError(400, 'รายการสินค้าในตะกร้าไม่ถูกต้อง กรุณาลองใหม่', 'INVALID_CART_ITEMS');
  }

  const result = await checkoutService.checkout({
    userId: req.user.id,
    paymentMethodId,
    items: items.map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
    note,
  });

  res.status(201).json({ success: true, data: result });
});

module.exports = { checkout };
