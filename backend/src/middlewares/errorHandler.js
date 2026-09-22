const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Unexpected error — log full detail server-side, keep response generic.
  // eslint-disable-next-line no-console
  console.error('[unhandled]', err);
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
  });
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
