import bcrypt from "bcryptjs";
import { z } from "zod";
import Admin from "../models/Admin.js";
import { AppError, asyncHandler } from "../utils/http.js";
import { signAdminToken, setAuthCookie, clearAuthCookie } from "../utils/authCookie.js";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

// Compared against when the email doesn't exist, so response time doesn't reveal it.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Please enter a valid email and password", 400);
  const { email, password } = parsed.data;

  const admin = await Admin.findOne({ email }).select("+passwordHash");
  const passwordOk = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
  if (!admin || !passwordOk) throw new AppError("Invalid email or password", 401);

  setAuthCookie(res, signAdminToken(admin._id));
  res.json({ success: true, data: { admin } });
});

export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, data: null });
};

export const me = (req, res) => {
  res.json({ success: true, data: { admin: req.admin } });
};