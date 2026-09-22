const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// Payment methods are reference data owned by the database, not by the
// frontend. The storefront reads them from here so that renaming a method,
// deactivating one, or re-seeding the table (which changes the serial ids)
// can never leave the checkout screen sending an id that does not exist.
async function listActiveMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name')
    .eq('is_active', true)
    .order('id', { ascending: true });

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

module.exports = { listActiveMethods };
