const ApiError = require('../utils/ApiError');

// Restricts a route to specific staff roles (e.g. only 'owner' may delete
// products or manage other staff). Must run AFTER requireStaffAuth.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.staff) {
      return next(new ApiError(401, 'กรุณาเข้าสู่ระบบก่อนใช้งาน', 'UNAUTHENTICATED'));
    }
    if (!allowedRoles.includes(req.staff.role)) {
      return next(new ApiError(403, 'คุณไม่มีสิทธิ์ดำเนินการนี้', 'FORBIDDEN'));
    }
    return next();
  };
}

module.exports = requireRole;
