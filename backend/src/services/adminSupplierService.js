const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function list() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name, contact_name, phone, address, is_active')
    .eq('is_active', true)
    .order('name');
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function create({ name, contact_name, phone, address }) {
  if (!name) throw new ApiError(400, 'กรุณากรอกชื่อผู้จัดจำหน่าย', 'MISSING_FIELDS');
  const { data, error } = await supabase
    .from('suppliers')
    .insert({ name, contact_name, phone, address })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') throw new ApiError(409, 'มีผู้จัดจำหน่ายรายนี้อยู่แล้ว', 'DUPLICATE_SUPPLIER');
    throw new ApiError(400, error.message, 'CREATE_FAILED');
  }
  return data;
}

module.exports = { list, create };
