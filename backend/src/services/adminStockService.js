const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const MOVEMENT_TYPES = ['restock', 'adjustment', 'expired', 'return', 'damaged'];

// The ONLY entry point (besides checkout_sale) allowed to change
// products.stock_qty — always via the adjust_stock() Postgres function so
// every change is paired with an auditable stock_movements row.
async function adjust({ productId, staffId, movementType, quantityChange, note }) {
  if (!MOVEMENT_TYPES.includes(movementType)) {
    throw new ApiError(400, 'ประเภทการเคลื่อนไหวสต๊อกไม่ถูกต้อง', 'INVALID_MOVEMENT_TYPE');
  }
  if (!Number.isInteger(Number(quantityChange)) || Number(quantityChange) === 0) {
    throw new ApiError(400, 'จำนวนต้องเป็นจำนวนเต็มและไม่เป็นศูนย์', 'INVALID_QUANTITY');
  }

  const { data: stockAfter, error } = await supabase.rpc('adjust_stock', {
    p_product_id: productId,
    p_staff_id: staffId,
    p_movement_type: movementType,
    p_quantity_change: Number(quantityChange),
    p_note: note || null,
  });

  if (error) {
    if (String(error.message).includes('NEGATIVE_STOCK')) {
      throw new ApiError(409, 'จำนวนที่ปรับจะทำให้สต๊อกติดลบ', 'NEGATIVE_STOCK');
    }
    if (String(error.message).includes('PRODUCT_NOT_FOUND')) {
      throw new ApiError(404, 'ไม่พบสินค้านี้', 'PRODUCT_NOT_FOUND');
    }
    throw new ApiError(500, error.message, 'ADJUST_FAILED');
  }

  return { product_id: productId, stock_after: stockAfter };
}

async function listMovements({ productId, page = 1, limit = 30 }) {
  let query = supabase
    .from('stock_movements')
    .select(
      'id, movement_type, quantity_change, stock_after, note, created_at, product:product_id(id,name), staff:staff_id(id,full_name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (productId) query = query.eq('product_id', productId);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

async function lowStock() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_qty, min_stock, unit:unit_id(name)')
    .eq('is_active', true)
    .order('stock_qty', { ascending: true });

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data.filter((p) => p.stock_qty <= p.min_stock);
}

module.exports = { adjust, listMovements, lowStock };
