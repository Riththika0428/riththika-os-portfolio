import Admin from "../models/Admin.js";
import { AppError, asyncHandler } from "../utils/http.js";
import { COOKIE_NAME, verifyAdminToken } from "../utils/authCookie.js";

export const requireAdmin = Object.assign(asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError("Authentication required", 401);

  let payload;
  try {
    payload = verifyAdminToken(token);
  } catch {
    throw new AppError("Authentication required", 401);
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin) throw new AppError("Authentication required", 401);
  // Tokens from before this feature have no `tv`, which counts as version 0.
  if ((payload.tv ?? 0) !== (admin.tokenVersion ?? 0)) throw new AppError("Authentication required", 401);

  req.admin = admin;
  next();
}), { guard: "admin" }); // `guard` lets `npm run audit` see which routes are protected