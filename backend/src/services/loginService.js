const ApiError = require('../utils/ApiError');
const staffAuthService = require('./staffAuthService');
const authService = require('./authService');

// Backs the single /login form shared by customers and staff (see
// docs/SETUP_GUIDE.md). Tries the email against `staff` first, then
// `users`, and always fails with the same generic message so a probing
// request can't tell which table (if either) the email belongs to.
async function login({ email, password, deviceInfo, ip }) {
  try {
    const result = await staffAuthService.login({ identifier: email, password, deviceInfo, ip });
    return { role: 'staff', token: result.token, staff: result.staff };
  } catch (err) {
    if (!(err instanceof ApiError) || err.code !== 'INVALID_CREDENTIALS') throw err;
  }

  const result = await authService.login({ email, password, deviceInfo, ip });
  return { role: 'customer', token: result.token, user: result.user };
}

module.exports = { login };
