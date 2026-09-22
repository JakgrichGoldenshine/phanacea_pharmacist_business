const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function listProducts({ categoryId, search, page = 1, limit = 20 }) {
  let query = supabase
    .from('products')
    .select(
      'id, name, brand, price, stock_qty, min_stock, description, is_active, category:category_id(id,name), unit:unit_id(id,name)',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .order('id', { ascending: true });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) query = query.ilike('name', `%${search}%`);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');

  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, brand, price, stock_qty, min_stock, description, category:category_id(id,name), unit:unit_id(id,name)'
    )
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!data) throw new ApiError(404, 'ไม่พบสินค้านี้', 'PRODUCT_NOT_FOUND');
  return data;
}

async function listCategories() {
  const { data, error } = await supabase.from('categories').select('id, name, description').order('id');
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

// Re-validates prices/stock server-side for a cart payload — never trust
// prices sent from the client when quoting or checking out.
async function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'ตะกร้าสินค้าว่างเปล่า', 'EMPTY_CART');
  }

  const ids = items.map((i) => i.product_id);
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, stock_qty, is_active')
    .in('id', ids);

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');

  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  const lines = items.map(({ product_id, quantity }) => {
    const product = byId.get(product_id);
    if (!product || !product.is_active) {
      throw new ApiError(404, `ไม่พบสินค้ารหัส ${product_id}`, 'PRODUCT_NOT_FOUND');
    }
    if (quantity < 1) {
      throw new ApiError(400, 'จำนวนสินค้าต้องมากกว่า 0', 'INVALID_QUANTITY');
    }
    if (product.stock_qty < quantity) {
      throw new ApiError(409, `สินค้า "${product.name}" คงเหลือไม่พอ`, 'INSUFFICIENT_STOCK');
    }
    const line_total = Number(product.price) * quantity;
    subtotal += line_total;
    return {
      product_id: product.id,
      name: product.name,
      unit_price: Number(product.price),
      quantity,
      line_total,
      in_stock: product.stock_qty,
    };
  });

  return { lines, subtotal, item_count: lines.reduce((n, l) => n + l.quantity, 0) };
}

module.exports = { listProducts, getProductById, listCategories, priceCart };
