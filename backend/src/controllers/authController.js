const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');
const loginService = require('../services/loginService');
const demoLoginService = require('../services/demoLoginService');

const register = asyncHandler(async (req, res) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password || !full_name) {
    throw new ApiError(400, 'กรุณากรอกข้อมูลให้ครบถ้วน', 'MISSING_FIELDS');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', 'WEAK_PASSWORD');
  }

  const user = await authService.register({ username, email, password, full_name });
  res.status(201).json({ success: true, data: user });
});

// Single login endpoint shared by the customer storefront and the admin
// console (see frontend/src/pages/Login.jsx) — resolves to a staff or
// customer session depending on which table the email belongs to.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'กรุณากรอกอีเมลและรหัสผ่าน', 'MISSING_FIELDS');
  }

  const result = await loginService.login({
    email,
    password,
    deviceInfo: req.headers['user-agent'],
    ip: req.ip,
  });

  res.json({ success: true, data: result });
});

// Behind requireDemoLoginEnabled — see that middleware and demoLoginService.
const demoLogin = asyncHandler(async (req, res) => {
  const { as } = req.body;
  const result = await demoLoginService.login({
    as,
    deviceInfo: req.headers['user-agent'],
    ip: req.ip,
  });
  res.json({ success: true, data: result });
});

const logout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) await authService.logout(token);
  res.json({ success: true, message: 'ออกจากระบบเรียบร้อย' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, demoLogin, logout, me };
