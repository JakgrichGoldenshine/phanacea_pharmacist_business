const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const { priceCart } = require('./productService');

// Optional: attach a walk-in sale to a registered customer account by
// exact email match, purely for their order-history page — never
// required, since most POS sales are anonymous walk-ins.
async function lookupCustomerByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('email', email)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

// The in-store register. Distinct from the customer checkoutService:
// - staff_id is the logged-in cashier, not a fixed "online counter" account
// - status is always 'completed' immediately (cash/card was taken on the spot)
// Both still funnel through the SAME checkout_sale() Postgres function, so
// stock is decremented and audited identically regardless of channel.
async function checkout({ staffId, userId, paymentMethodId, items, note }) {
  const priced = await priceCart(items);

  const { data: saleId, error } = await supabase.rpc('checkout_sale', {
    p_staff_id: staffId,
    p_user_id: userId || null,
    p_payment_method_id: paymentMethodId,
    p_note: note || null,
    p_items: priced.lines.map((l) => ({
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
    p_status: 'completed',
  });

  if (error) {
    if (String(error.message).includes('INSUFFICIENT_STOCK')) {
      throw new ApiError(409, 'สินค้าบางรายการคงเหลือไม่พอ', 'INSUFFICIENT_STOCK');
    }
    throw new ApiError(500, error.message, 'CHECKOUT_FAILED');
  }

  return { sale_id: saleId, total: priced.subtotal, items: priced.lines };
}

module.exports = { checkout, lookupCustomerByEmail };
