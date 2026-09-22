const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const { signToken, hashToken } = require('../utils/token');

const SESSION_HOURS = 12;

// Mints a token + staff_sessions row for an already-verified staff row.
// Shared by the password login below and services/demoLoginService.js
// (which authenticates a different way and skips straight to this).
async function issueSession(staff, { deviceInfo, ip } = {}) {
  const token = signToken({ sub: staff.id, username: staff.username, role: staff.role, type: 'staff' });
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

  await supabase.from('staff_sessions').insert({
    staff_id: staff.id,
    session_token: hashToken(token),
    device_info: deviceInfo || null,
    ip_address: ip || null,
    expires_at: expiresAt.toISOString(),
  });

  await supabase.from('staff').update({ last_login_at: new Date().toISOString() }).eq('id', staff.id);

  return {
    token,
    staff: { id: staff.id, username: staff.username, email: staff.email, full_name: staff.full_name, role: staff.role },
  };
}

// `identifier` matches either `username` (the original staff login field)
// or `email` (added so staff can also sign in through the unified /login
// form shared with customers — see services/loginService.js).
async function login({ identifier, password, deviceInfo, ip }) {
  const { data: staff, error } = await supabase
    .from('staff')
    .select('id, username, email, full_name, role, password_hash, is_active')
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .maybeSingle();

  const invalid = () => new ApiError(401, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'INVALID_CREDENTIALS');

  if (error || !staff || !staff.is_active) throw invalid();

  const match = await bcrypt.compare(password, staff.password_hash);
  if (!match) throw invalid();

  return issueSession(staff, { deviceInfo, ip });
}

async function logout(token) {
  await supabase.from('staff_sessions').update({ is_valid: false }).eq('session_token', hashToken(token));
}

module.exports = { login, logout, issueSession };
