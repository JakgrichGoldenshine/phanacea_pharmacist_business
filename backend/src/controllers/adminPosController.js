const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const adminPosService = require('../services/adminPosService');
const productService = require('../services/productService');

// POS product search reuses the exact same catalog query the storefront
// uses (active products only, live stock) — one source of truth for
// "what can currently be sold", whether online or at the counter.
const search = asyncHandler(async (req, res) => {
  const { search: term, limit } = req.query;
  const result = await productService.listProducts({ search: term, limit: limit ? Number(limit) : 20 });
  res.json({ success: true, ...result });
});

const lookupCustomer = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const customer = await adminPosService.lookupCustomerByEmail(email);
  res.json({ success: true, data: customer });
});

const checkout = asyncHandler(async (req, res) => {
  const { payment_method_id, items, note, customer_email } = req.body;
  if (!payment_method_id || !items || items.length === 0) {
    throw new ApiError(400, 'กรุณาเลือกช่องทางชำระเงินและเพิ่มสินค้าอย่างน้อย 1 รายการ', 'MISSING_FIELDS');
  }

  let userId = null;
  if (customer_email) {
    const customer = await adminPosService.lookupCustomerByEmail(customer_email);
    userId = customer?.id || null;
  }

  const result = await adminPosService.checkout({
    staffId: req.staff.id,
    userId,
    paymentMethodId: payment_method_id,
    items,
    note,
  });

  res.status(201).json({ success: true, data: result });
});

module.exports = { search, lookupCustomer, checkout };
