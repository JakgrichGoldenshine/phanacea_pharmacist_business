const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function list() {
  const { data, error } = await supabase.from('categories').select('id, name, description').order('id');
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function create({ name, description }) {
  if (!name) throw new ApiError(400, 'กรุณากรอกชื่อหมวดหมู่', 'MISSING_FIELDS');
  const { data, error } = await supabase.from('categories').insert({ name, description }).select().single();
  if (error) {
    if (error.code === '23505') throw new ApiError(409, 'มีหมวดหมู่นี้อยู่แล้ว', 'DUPLICATE_CATEGORY');
    throw new ApiError(400, error.message, 'CREATE_FAILED');
  }
  return data;
}

module.exports = { list, create };
