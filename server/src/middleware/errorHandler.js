export function notFound(_req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

// Turns every kind of thrown error into { success:false, message }.
// 4xx messages are meant for the admin and are shown; 5xx details stay in the server log.
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || err.status || 500; // ApiError uses statusCode, AppError uses status
  let message = err.message;

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join("; ") || "Validation failed";
  } else if (err.code === 11000) {
    status = 409;
    message = "That value already exists";
  }

  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;
  if (status >= 500) {
    console.error(err);
    message = "Something went wrong";
  }

  res.status(status).json({ success: false, message });
}