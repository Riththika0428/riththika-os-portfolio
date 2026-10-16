import { ApiError } from "./ApiError.js";

/** An error carrying its HTTP status under both names the error handlers look for (statusCode and status). */
export function httpError(status, message) {
  const err = new ApiError(status, message);
  err.status = status;
  return err;
}