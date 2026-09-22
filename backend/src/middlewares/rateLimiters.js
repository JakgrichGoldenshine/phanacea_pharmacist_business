const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Strict limiter for /auth/login and /auth/register — protects against
// credential-stuffing / brute-force attacks as requested in the spec.
const loginLimiter = rateLimit({
  windowMs: env.loginRateLimit.windowMinutes * 60 * 1000,
  max: env.loginRateLimit.maxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: `พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายใน ${env.loginRateLimit.windowMinutes} นาที`,
  },
  keyGenerator: (req) => `${req.ip}:${(req.body && (req.body.email || req.body.username)) || ''}`,
});

// Looser, general-purpose limiter applied to the whole API to absorb
// scraping / abuse without affecting normal browsing. The ceiling accounts
// for the live-chat screens, which poll for new messages every few seconds
// on top of whatever else the person is doing.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'มีการเรียก API บ่อยเกินไป กรุณาลองใหม่ในอีกสักครู่',
  },
});

// Support tickets and chat messages are cheap to spam-flood (no payment,
// no stock check gating them) — a tighter limiter than the general API
// one, scoped per logged-in user rather than per IP so one person can't
// drown out the support inbox even from a shared IP.
const supportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'ส่งข้อความบ่อยเกินไป กรุณาลองใหม่ในอีกสักครู่',
  },
  keyGenerator: (req) => `${req.ip}:${req.user?.id || req.staff?.id || ''}`,
});

// Live chat is a conversation, not a form submission: a tight per-5-minute
// budget like supportLimiter would cut someone off mid-sentence. This one
// allows a natural typing pace while still stopping a flood, and is keyed
// per identity so one abusive account cannot spend everyone else's quota.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'ส่งข้อความเร็วเกินไป กรุณารอสักครู่แล้วลองใหม่',
  },
  keyGenerator: (req) => `${req.ip}:${req.user?.id || req.staff?.id || ''}`,
});

module.exports = { loginLimiter, apiLimiter, supportLimiter, chatLimiter };
