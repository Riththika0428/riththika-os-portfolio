import { ApiError } from "../utils/ApiError.js";

// Browsers refuse to add a custom header to a cross-site request unless the target
// server's CORS policy allows it, and ours only allows CLIENT_URL. A forged form or
// <img>/<script> request from another site therefore cannot carry this header.
export const CSRF_HEADER = "x-requested-with";
export const CSRF_VALUE = "riththika-admin";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// The public contact form is the only write that works without logging in.
const isPublicWrite = (req) => req.method === "POST" && /^\/contact\/?$/.test(req.path);

function originOf(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Mount on "/api" after cors() and cookieParser().
 *   1. Every POST/PUT/PATCH/DELETE must carry  X-Requested-With: riththika-admin
 *   2. If the browser says where the request came from (Origin, or Referer as a fallback)
 *      it must be one of our own sites.
 * Requests with neither header (curl, server-to-server) are allowed through step 2:
 * an attacker's web page cannot make a browser omit Origin, and without the browser
 * there is no cookie to abuse.
 */
export function csrfGuard(allowedOrigins) {
  const allowed = new Set(allowedOrigins);

  return (req, _res, next) => {
    if (!UNSAFE_METHODS.has(req.method) || isPublicWrite(req)) return next();

    if (req.get(CSRF_HEADER) !== CSRF_VALUE) {
      return next(new ApiError(403, "Request blocked: missing security header"));
    }

    const origin = req.get("origin");
    const referer = req.get("referer");
    const source = origin !== undefined ? origin : referer !== undefined ? originOf(referer) : undefined;
    if (source !== undefined && !allowed.has(source)) {
      return next(new ApiError(403, "Request blocked: untrusted origin"));
    }
    next();
  };
}