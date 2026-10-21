import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => Object.assign((req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues ?? result.error.errors ?? [];
    const message = issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    throw new ApiError(400, message || "Invalid request body");
  }
  req.body = result.data;
  next();
}, { guard: "validate" });