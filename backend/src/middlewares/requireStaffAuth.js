const ApiError = require('../utils/ApiError');
const { verifyToken, hashToken } = require('../utils/token');
const supabase = require('../config/supabase');

// Verifies the staff Bearer JWT AND checks the matching staff_sessions row
// is still valid — mirrors requireAuth but scoped to the `staff` table so
// customer and back-office sessions never mix.
async function requireStaffAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'กรุณาเข้าสู่ระบบก่อนใช้งาน', 'UNAUTHENTICATED');
    }

    const payload = verifyToken(token);
    if (payload.type !== 'staff') {
      throw new ApiError(401, 'โทเคนไม่ถูกต้องสำหรับผู้ดูแลระบบ', 'INVALID_TOKEN');
    }

    const tokenHash = hashToken(token);
    const { data: session, error } = await supabase
      .from('staff_sessions')
      .select('id, expires_at, is_valid')
      .eq('staff_id', payload.sub)
      .eq('session_token', tokenHash)
      .eq('is_valid', true)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      throw new ApiError(401, 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'SESSION_EXPIRED');
    }

    req.staff = { id: payload.sub, username: payload.username, role: payload.role };
    return next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(401, 'โทเคนไม่ถูกต้อง', 'INVALID_TOKEN'));
  }
}

module.exports = requireStaffAuth;
