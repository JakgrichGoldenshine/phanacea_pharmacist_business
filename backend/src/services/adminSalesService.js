const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

async function listSales({ status, page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('sales')
    .select(
      'id, total_amount, note, status, sold_at, payment_method:payment_method_id(id,name), staff:staff_id(id,full_name,phone), user:user_id(id,full_name,email)',
      { count: 'exact' }
    )
    .order('sold_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

async function getSaleById(id) {
  const { data: sale, error } = await supabase
    .from('sales')
    .select(
      'id, total_amount, note, status, sold_at, payment_method:payment_method_id(id,name), staff:staff_id(id,full_name,phone), user:user_id(id,full_name,email)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!sale) throw new ApiError(404, 'ไม่พบคำสั่งซื้อนี้', 'SALE_NOT_FOUND');

  const { data: lines, error: linesError } = await supabase
    .from('order_lines')
    .select('id, quantity, unit_price, total_price, product:product_id(id,name,brand)')
    .eq('sale_id', id);

  if (linesError) throw new ApiError(500, linesError.message, 'DB_ERROR');

  return { ...sale, items: lines };
}

// The ONLY place order status may change — a thin, validated wrapper so
// every status transition goes through one auditable code path rather
// than ad-hoc updates scattered across the codebase.
async function updateStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, 'สถานะคำสั่งซื้อไม่ถูกต้อง', 'INVALID_STATUS');
  }

  const { data, error } = await supabase
    .from('sales')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .maybeSingle();

  if (error) throw new ApiError(400, error.message, 'UPDATE_STATUS_FAILED');
  if (!data) throw new ApiError(404, 'ไม่พบคำสั่งซื้อนี้', 'SALE_NOT_FOUND');
  return data;
}

module.exports = { listSales, getSaleById, updateStatus, ORDER_STATUSES };
