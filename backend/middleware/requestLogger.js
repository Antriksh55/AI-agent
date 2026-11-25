/**
 * Safe request logger.
 * Does NOT log request bodies (which may contain customer PII).
 */
function requestLogger(req, _res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
}

module.exports = { requestLogger };
