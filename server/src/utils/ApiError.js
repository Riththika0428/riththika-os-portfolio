/**
 * A simple typed error for expected/handled failures (bad input,
 * not found, etc.) — carries an HTTP status so the error-handling
 * middleware knows how to respond, distinguishing these from genuine
 * unexpected server errors.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}