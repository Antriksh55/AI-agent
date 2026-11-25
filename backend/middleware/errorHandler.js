/**
 * Central error handler.
 * Keeps stack traces out of API responses in production.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";

  // Never log API keys or tokens
  console.error(`[ERROR] ${req.method} ${req.path} → ${err.message}`);

  res.status(status).json({
    success: false,
    error: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
