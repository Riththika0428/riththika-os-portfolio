import jwt from "jsonwebtoken";

export const COOKIE_NAME = "admin_token";
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // "none" is needed when frontend and API are on different domains
    path: "/",
  };
}

export function signAdminToken(adminId) {
  return jwt.sign({ sub: String(adminId) }, process.env.ADMIN_AUTH_SECRET, {
    algorithm: "HS256",
    expiresIn: "8h",
  });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, process.env.ADMIN_AUTH_SECRET, { algorithms: ["HS256"] });
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: MAX_AGE_MS });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}