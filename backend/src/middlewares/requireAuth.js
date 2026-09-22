const ApiError = require('../utils/ApiError');
const { verifyToken, hashToken } = require('../utils/token');
const supabase = require('../config/supabase');

// Verifies the Bearer JWT AND checks the matching user_sessions row is
// still valid (not logged out / not expired) — so revoking a session
// takes effect immediately even before the JWT itself expires.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'กรุณาเข้าสู่ระบบก่อนใช้งาน', 'UNAUTHENTICATED');
    }

    const payload = verifyToken(token);
    const tokenHash = hashToken(token);

    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('id, expires_at, is_valid')
      .eq('user_id', payload.sub)
      .eq('session_token', tokenHash)
      .eq('is_valid', true)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      throw new ApiError(401, 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'SESSION_EXPIRED');
    }

    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(401, 'โทเคนไม่ถูกต้อง', 'INVALID_TOKEN'));
  }
}

module.exports = requireAuth;
