const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// Demo login must be explicitly turned on with DEMO_LOGIN_ENABLED=true on
// this deployment (see services/demoLoginService.js). When it isn't, this
// answers 404 rather than 403 so the route looks like it doesn't exist at
// all, instead of existing-but-refusing.
function requireDemoLoginEnabled(req, res, next) {
  if (!env.demoLoginEnabled) {
    return next(new ApiError(404, 'ไม่พบ endpoint นี้', 'NOT_FOUND'));
  }
  next();
}

module.exports = requireDemoLoginEnabled;
