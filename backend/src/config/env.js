require('dotenv').config();

// FRONTEND_URL accepts a single origin or a comma-separated list, so one
// deployment can serve localhost plus one or more production domains.
const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  frontendUrls,
  frontendUrl: frontendUrls[0],
  // Optional regex (as a string) matching Vercel preview deployments,
  // e.g. ^https://phanacea-[a-z0-9-]+\.vercel\.app$
  vercelPreviewPattern: process.env.FRONTEND_PREVIEW_PATTERN || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  loginRateLimit: {
    windowMinutes: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MIN || 15),
    maxAttempts: Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || 5),
  },
  // Password-less "log in as admin/staff" shortcut for demos — see
  // services/demoLoginService.js. Off unless explicitly turned on for a
  // presentation deployment; never enable this on a deployment holding
  // real accounts or data.
  demoLoginEnabled: process.env.DEMO_LOGIN_ENABLED === 'true',
};
