const asyncHandler = require('../utils/asyncHandler');
const adminStaffService = require('../services/adminStaffService');

const list = asyncHandler(async (req, res) => {
  const staff = await adminStaffService.listStaff();
  res.json({ success: true, data: staff, roles: adminStaffService.ROLES });
});

const create = asyncHandler(async (req, res) => {
  const { username, password, full_name: fullName, role, phone } = req.body;
  const staff = await adminStaffService.createStaff({ username, password, fullName, role, phone });
  res.status(201).json({ success: true, data: staff });
});

const update = asyncHandler(async (req, res) => {
  const { full_name: fullName, role, phone, is_active: isActive } = req.body;
  const staff = await adminStaffService.updateStaff(req.params.id, req.staff.id, { fullName, role, phone, isActive });
  res.json({ success: true, data: staff });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await adminStaffService.resetPassword(req.params.id, req.body.password);
  res.json({ success: true, data: result, message: 'ตั้งรหัสผ่านใหม่เรียบร้อย — บัญชีนี้ถูกออกจากระบบทุกอุปกรณ์' });
});

const changeOwnPassword = asyncHandler(async (req, res) => {
  const { current_password: currentPassword, new_password: newPassword } = req.body;
  const result = await adminStaffService.changeOwnPassword(req.staff.id, currentPassword, newPassword);
  res.json({ success: true, data: result, message: 'เปลี่ยนรหัสผ่านเรียบร้อย กรุณาเข้าสู่ระบบใหม่' });
});

module.exports = { list, create, update, resetPassword, changeOwnPassword };
