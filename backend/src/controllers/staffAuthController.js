const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const staffAuthService = require('../services/staffAuthService');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 'MISSING_FIELDS');
  }

  const result = await staffAuthService.login({
    identifier: username,
    password,
    deviceInfo: req.headers['user-agent'],
    ip: req.ip,
  });

  res.json({ success: true, data: result });
});

const logout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) await staffAuthService.logout(token);
  res.json({ success: true, message: 'ออกจากระบบเรียบร้อย' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.staff });
});

module.exports = { login, logout, me };
