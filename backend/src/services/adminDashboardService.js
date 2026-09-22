const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function getStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todaySales, totalProducts, totalCustomers, allProducts] = await Promise.all([
    supabase.from('sales').select('total_amount', { count: 'exact' }).gte('sold_at', startOfToday.toISOString()),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('stock_qty, min_stock').eq('is_active', true),
  ]);

  if (todaySales.error) throw new ApiError(500, todaySales.error.message, 'DB_ERROR');
  if (totalProducts.error) throw new ApiError(500, totalProducts.error.message, 'DB_ERROR');
  if (totalCustomers.error) throw new ApiError(500, totalCustomers.error.message, 'DB_ERROR');
  if (allProducts.error) throw new ApiError(500, allProducts.error.message, 'DB_ERROR');

  const todayRevenue = (todaySales.data || []).reduce((sum, s) => sum + Number(s.total_amount), 0);
  const lowStockCount = (allProducts.data || []).filter((p) => p.stock_qty <= p.min_stock).length;

  return {
    today_orders: todaySales.count || 0,
    today_revenue: todayRevenue,
    total_products: totalProducts.count || 0,
    total_customers: totalCustomers.count || 0,
    low_stock_count: lowStockCount,
  };
}

module.exports = { getStats };
