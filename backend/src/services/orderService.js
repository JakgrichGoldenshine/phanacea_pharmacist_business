const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// Customer-facing order history — scoped strictly to the requesting user's
// own sales. Deliberately separate from adminSalesService, which can see
// every customer's orders; keeping the two apart means a bug in one can
// never leak another customer's purchase history.
async function listMyOrders(userId) {
  const { data, error } = await supabase
    .from('sales')
    .select('id, total_amount, note, status, sold_at, payment_method:payment_method_id(id,name)')
    .eq('user_id', userId)
    .order('sold_at', { ascending: false });

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function getMyOrderById(userId, saleId) {
  const { data: sale, error } = await supabase
    .from('sales')
    .select(
      'id, total_amount, note, status, sold_at, payment_method:payment_method_id(id,name), staff:staff_id(full_name,phone)'
    )
    .eq('id', saleId)
    .eq('user_id', userId) // ensures a customer can never fetch someone else's order
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!sale) throw new ApiError(404, 'ไม่พบคำสั่งซื้อนี้', 'ORDER_NOT_FOUND');

  const { data: lines, error: linesError } = await supabase
    .from('order_lines')
    .select('id, quantity, unit_price, total_price, product:product_id(id,name,brand)')
    .eq('sale_id', saleId);

  if (linesError) throw new ApiError(500, linesError.message, 'DB_ERROR');

  return { ...sale, items: lines };
}

module.exports = { listMyOrders, getMyOrderById };
