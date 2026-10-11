/**
 * Catches any request that didn't match a real route and returns a
 * clean JSON 404 instead of Express's default HTML error page.
 */
export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}