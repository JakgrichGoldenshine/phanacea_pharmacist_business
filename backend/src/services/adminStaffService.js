const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// ── Back-office account management ───────────────────────────────────
// Creating and disabling admin accounts is the single most sensitive
// operation in the console, so every rule that protects against locking
// everyone out of the system lives here rather than in the controller.

const ROLES = ['owner', 'pharmacist', 'assistant', 'staff'];
const BCRYPT_ROUNDS = 12;
const STAFF_SELECT = 'id, username, full_name, role, phone, is_active, last_login_at, created_at';

function assertValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร', 'WEAK_PASSWORD');
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError(400, 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข', 'WEAK_PASSWORD');
  }
}

function assertValidRole(role) {
  if (!ROLES.includes(role)) {
    throw new ApiError(400, `ตำแหน่งต้องเป็นหนึ่งใน: ${ROLES.join(', ')}`, 'INVALID_ROLE');
  }
}

function normalizeUsername(username) {
  const value = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!/^[a-z0-9_.-]{3,50}$/.test(value)) {
    throw new ApiError(
      400,
      'ชื่อผู้ใช้ต้องยาว 3-50 ตัวอักษร และใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง และขีดล่าง',
      'INVALID_USERNAME'
    );
  }
  return value;
}

// Revoking every session is what makes "deactivate" and "reset password"
// take effect immediately instead of whenever the JWT happens to expire.
async function revokeSessions(staffId) {
  await supabase.from('staff_sessions').update({ is_valid: false }).eq('staff_id', staffId);
}

async function getStaffOrThrow(id) {
  const { data, error } = await supabase.from('staff').select(STAFF_SELECT).eq('id', id).maybeSingle();
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!data) throw new ApiError(404, 'ไม่พบบัญชีพนักงานนี้', 'STAFF_NOT_FOUND');
  return data;
}

async function countActiveOwners(excludeId) {
  let query = supabase.from('staff').select('id', { count: 'exact', head: true }).eq('role', 'owner').eq('is_active', true);
  if (excludeId) query = query.neq('id', excludeId);
  const { count, error } = await query;
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return count || 0;
}

async function listStaff() {
  const { data, error } = await supabase.from('staff').select(STAFF_SELECT).order('id', { ascending: true });
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function createStaff({ username, password, fullName, role, phone }) {
  const cleanUsername = normalizeUsername(username);
  assertValidPassword(password);
  assertValidRole(role);

  if (!fullName || !String(fullName).trim()) {
    throw new ApiError(400, 'กรุณากรอกชื่อ-นามสกุล', 'MISSING_FULL_NAME');
  }

  const { data: existing } = await supabase.from('staff').select('id').eq('username', cleanUsername).maybeSingle();
  if (existing) {
    throw new ApiError(409, 'ชื่อผู้ใช้นี้ถูกใช้แล้ว', 'USERNAME_TAKEN');
  }

  const { data, error } = await supabase
    .from('staff')
    .insert({
      username: cleanUsername,
      password_hash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      full_name: String(fullName).trim(),
      role,
      phone: phone ? String(phone).trim() : null,
      is_active: true,
    })
    .select(STAFF_SELECT)
    .single();

  if (error) throw new ApiError(400, error.message, 'CREATE_STAFF_FAILED');
  return data;
}

async function updateStaff(id, actingStaffId, { fullName, role, phone, isActive }) {
  const target = await getStaffOrThrow(id);
  const isSelf = Number(id) === Number(actingStaffId);
  const patch = {};

  if (fullName !== undefined) {
    if (!String(fullName).trim()) throw new ApiError(400, 'กรุณากรอกชื่อ-นามสกุล', 'MISSING_FULL_NAME');
    patch.full_name = String(fullName).trim();
  }
  if (phone !== undefined) patch.phone = phone ? String(phone).trim() : null;

  if (role !== undefined && role !== target.role) {
    assertValidRole(role);
    // An owner changing their own role, or the last owner being demoted,
    // would leave nobody able to manage accounts at all.
    if (isSelf) throw new ApiError(400, 'ไม่สามารถเปลี่ยนตำแหน่งของบัญชีตัวเองได้', 'CANNOT_CHANGE_OWN_ROLE');
    if (target.role === 'owner' && (await countActiveOwners(target.id)) === 0) {
      throw new ApiError(400, 'ต้องมีบัญชีเจ้าของ (owner) ที่ใช้งานได้อย่างน้อย 1 บัญชี', 'LAST_OWNER');
    }
    patch.role = role;
  }

  if (isActive !== undefined && Boolean(isActive) !== target.is_active) {
    if (isSelf) throw new ApiError(400, 'ไม่สามารถปิดใช้งานบัญชีตัวเองได้', 'CANNOT_DEACTIVATE_SELF');
    if (!isActive && target.role === 'owner' && (await countActiveOwners(target.id)) === 0) {
      throw new ApiError(400, 'ต้องมีบัญชีเจ้าของ (owner) ที่ใช้งานได้อย่างน้อย 1 บัญชี', 'LAST_OWNER');
    }
    patch.is_active = Boolean(isActive);
  }

  if (Object.keys(patch).length === 0) return target;

  const { data, error } = await supabase.from('staff').update(patch).eq('id', id).select(STAFF_SELECT).single();
  if (error) throw new ApiError(400, error.message, 'UPDATE_STAFF_FAILED');

  // A disabled account must lose access now, not at token expiry.
  if (patch.is_active === false) await revokeSessions(id);

  return data;
}

async function resetPassword(id, newPassword) {
  assertValidPassword(newPassword);
  await getStaffOrThrow(id);

  const { error } = await supabase
    .from('staff')
    .update({ password_hash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) })
    .eq('id', id);

  if (error) throw new ApiError(400, error.message, 'RESET_PASSWORD_FAILED');

  // Whoever was holding the old credentials is signed out immediately.
  await revokeSessions(id);
  return { id: Number(id) };
}

async function changeOwnPassword(staffId, currentPassword, newPassword) {
  assertValidPassword(newPassword);

  const { data: staff, error } = await supabase
    .from('staff')
    .select('id, password_hash')
    .eq('id', staffId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!staff) throw new ApiError(404, 'ไม่พบบัญชีพนักงานนี้', 'STAFF_NOT_FOUND');

  const matches = await bcrypt.compare(String(currentPassword || ''), staff.password_hash);
  if (!matches) throw new ApiError(401, 'รหัสผ่านปัจจุบันไม่ถูกต้อง', 'INVALID_CREDENTIALS');

  const { error: updateError } = await supabase
    .from('staff')
    .update({ password_hash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) })
    .eq('id', staffId);

  if (updateError) throw new ApiError(400, updateError.message, 'CHANGE_PASSWORD_FAILED');

  await revokeSessions(staffId); // every device re-authenticates, including this one
  return { id: Number(staffId) };
}

module.exports = { listStaff, createStaff, updateStaff, resetPassword, changeOwnPassword, ROLES };
