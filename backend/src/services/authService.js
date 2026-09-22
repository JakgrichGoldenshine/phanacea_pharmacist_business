const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const { signToken, hashToken } = require('../utils/token');

const SESSION_DAYS = 30;

async function register({ username, email, password, full_name }) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();

  if (existing) {
    throw new ApiError(409, 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว', 'USER_EXISTS');
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ username, email, password_hash, full_name })
    .select('id, username, email, full_name')
    .single();

  if (error) throw new ApiError(400, error.message, 'REGISTER_FAILED');

  return user;
}

// Mints a token + user_sessions row for an already-verified user row.
// Shared by the password login below and services/demoLoginService.js
// (which authenticates a different way and skips straight to this).
async function issueSession(user, { deviceInfo, ip } = {}) {
  const token = signToken({ sub: user.id, email: user.email });
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await supabase.from('user_sessions').insert({
    user_id: user.id,
    session_token: hashToken(token),
    device_info: deviceInfo || null,
    ip_address: ip || null,
    expires_at: expiresAt.toISOString(),
  });

  await supabase
    .from('users')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
    },
  };
}

async function login({ email, password, deviceInfo, ip }) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, username, full_name, password_hash, is_active')
    .eq('email', email)
    .maybeSingle();

  // Same generic message whether the email exists or not — avoids
  // leaking which emails are registered.
  const invalid = () => new ApiError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'INVALID_CREDENTIALS');

  if (error || !user || !user.is_active) throw invalid();

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw invalid();

  return issueSession(user, { deviceInfo, ip });
}

async function logout(token) {
  await supabase
    .from('user_sessions')
    .update({ is_valid: false })
    .eq('session_token', hashToken(token));
}

module.exports = { register, login, logout, issueSession };
