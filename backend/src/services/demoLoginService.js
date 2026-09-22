const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const staffAuthService = require('./staffAuthService');

// Password-less "log in as ___" shortcut for live presentations, backing
// the hidden demo-login trigger on the /login page. Entirely disabled
// unless DEMO_LOGIN_ENABLED=true (see config/env.js) — the route calling
// this is gated by middlewares/requireDemoLoginEnabled, which this module
// trusts rather than re-checking, so it must never be reachable from any
// other route.
const DEMO_ACCOUNTS = {
  admin: { table: 'staff', column: 'username', value: 'admin' },
  staff: { table: 'staff', column: 'username', value: 'staff' },
};

async function login({ as, deviceInfo, ip }) {
  const account = DEMO_ACCOUNTS[as];
  if (!account) throw new ApiError(400, 'ไม่รู้จักบัญชีตัวอย่างนี้', 'INVALID_DEMO_ROLE');

  const { data: staff, error } = await supabase
    .from('staff')
    .select('id, username, email, full_name, role, is_active')
    .eq(account.column, account.value)
    .maybeSingle();

  if (error || !staff || !staff.is_active) {
    throw new ApiError(404, 'ไม่พบบัญชีตัวอย่างนี้ในฐานข้อมูล', 'DEMO_ACCOUNT_NOT_FOUND');
  }

  const result = await staffAuthService.issueSession(staff, { deviceInfo, ip });
  return { role: 'staff', token: result.token, staff: result.staff };
}

module.exports = { login };
