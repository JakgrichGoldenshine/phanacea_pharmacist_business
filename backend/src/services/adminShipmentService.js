const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// Inbound stock receiving from suppliers — the third and final path
// allowed to change products.stock_qty (alongside checkout_sale and
// adjust_stock), always via the receive_shipment() DB function so the
// header, line items, stock increase, and audit trail are one atomic unit.
async function list({ page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('shipments')
    .select(
      'id, note, received_at, supplier:supplier_id(id,name), staff:staff_id(id,full_name)',
      { count: 'exact' }
    )
    .order('received_at', { ascending: false })
    .range(from, to);

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('id, note, received_at, supplier:supplier_id(id,name), staff:staff_id(id,full_name)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!shipment) throw new ApiError(404, 'ไม่พบใบรับสินค้านี้', 'SHIPMENT_NOT_FOUND');

  const { data: items, error: itemsError } = await supabase
    .from('shipment_items')
    .select('id, quantity, unit_cost, total_cost, expiry_date, lot_number, product:product_id(id,name,brand)')
    .eq('shipment_id', id);

  if (itemsError) throw new ApiError(500, itemsError.message, 'DB_ERROR');

  return { ...shipment, items };
}

async function create({ supplierId, staffId, note, items }) {
  if (!supplierId) throw new ApiError(400, 'กรุณาเลือกผู้จัดจำหน่าย', 'MISSING_SUPPLIER');
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', 'EMPTY_SHIPMENT');
  }

  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0 || item.unit_cost === undefined) {
      throw new ApiError(400, 'ข้อมูลรายการสินค้าไม่ครบถ้วน', 'INVALID_ITEM');
    }
  }

  const { data: shipmentId, error } = await supabase.rpc('receive_shipment', {
    p_supplier_id: supplierId,
    p_staff_id: staffId,
    p_note: note || null,
    p_items: items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_cost: i.unit_cost,
      expiry_date: i.expiry_date || '',
      lot_number: i.lot_number || '',
    })),
  });

  if (error) {
    if (String(error.message).includes('PRODUCT_NOT_FOUND')) {
      throw new ApiError(404, 'พบสินค้าที่ไม่ถูกต้องในรายการ', 'PRODUCT_NOT_FOUND');
    }
    throw new ApiError(500, error.message, 'SHIPMENT_FAILED');
  }

  return getById(shipmentId);
}

module.exports = { list, getById, create };
