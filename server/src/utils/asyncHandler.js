/**
 * Wraps an async route handler so any rejected promise/thrown error
 * is forwarded to Express's error-handling middleware, instead of
 * needing a try/catch in every single controller.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}