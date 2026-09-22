const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const SELECT_FIELDS =
  'id, name, brand, price, stock_qty, min_stock, description, is_active, created_at, updated_at, category:category_id(id,name), unit:unit_id(id,name)';

async function listAll({ search, categoryId, page = 1, limit = 20 }) {
  let query = supabase.from('products').select(SELECT_FIELDS, { count: 'exact' }).order('id');

  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) query = query.ilike('name', `%${search}%`);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const { data, error } = await supabase.from('products').select(SELECT_FIELDS).eq('id', id).maybeSingle();
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!data) throw new ApiError(404, 'ไม่พบสินค้านี้', 'PRODUCT_NOT_FOUND');
  return data;
}

// Creating a product may seed an initial stock count — logged as an
// 'adjustment' movement so the audit trail always explains every unit.
async function create({ name, brand, category_id, unit_id, price, stock_qty = 0, min_stock = 10, description, staffId }) {
  if (!name || !category_id || !unit_id || price === undefined) {
    throw new ApiError(400, 'กรุณากรอกชื่อ หมวดหมู่ หน่วย และราคาสินค้า', 'MISSING_FIELDS');
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({ name, brand, category_id, unit_id, price, stock_qty: 0, min_stock, description })
    .select(SELECT_FIELDS)
    .single();

  if (error) throw new ApiError(400, error.message, 'CREATE_FAILED');

  if (Number(stock_qty) > 0) {
    const { error: rpcError } = await supabase.rpc('adjust_stock', {
      p_product_id: product.id,
      p_staff_id: staffId,
      p_movement_type: 'adjustment',
      p_quantity_change: Number(stock_qty),
      p_note: 'สต๊อกเริ่มต้นตอนสร้างสินค้า',
    });
    if (rpcError) throw new ApiError(400, rpcError.message, 'STOCK_INIT_FAILED');
    return getById(product.id);
  }

  return product;
}

// Product edits NEVER touch stock_qty directly — only name/price/category/
// description/etc. Stock only moves through adjustStock() below.
async function update(id, fields) {
  const { stock_qty, ...safeFields } = fields; // eslint-disable-line no-unused-vars

  const { data, error } = await supabase
    .from('products')
    .update({ ...safeFields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SELECT_FIELDS)
    .maybeSingle();

  if (error) throw new ApiError(400, error.message, 'UPDATE_FAILED');
  if (!data) throw new ApiError(404, 'ไม่พบสินค้านี้', 'PRODUCT_NOT_FOUND');
  return data;
}

// Soft delete — keeps historical order_lines / stock_movements intact.
async function deactivate(id) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, is_active')
    .maybeSingle();

  if (error) throw new ApiError(400, error.message, 'DELETE_FAILED');
  if (!data) throw new ApiError(404, 'ไม่พบสินค้านี้', 'PRODUCT_NOT_FOUND');
  return data;
}

async function getMeta() {
  const [{ data: categories, error: catError }, { data: units, error: unitError }] = await Promise.all([
    supabase.from('categories').select('id, name').order('id'),
    supabase.from('product_units').select('id, name').order('id'),
  ]);
  if (catError) throw new ApiError(500, catError.message, 'DB_ERROR');
  if (unitError) throw new ApiError(500, unitError.message, 'DB_ERROR');
  return { categories, units };
}

module.exports = { listAll, getById, create, update, deactivate, getMeta };
