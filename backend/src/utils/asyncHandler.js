// Wrap async route handlers so any rejected promise is forwarded to
// Express' error middleware instead of crashing the process.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
