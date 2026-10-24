import { Router } from "express";
import { login, logout, me, changePassword, logoutAll } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { loginLimiter, passwordLimiter } from "../middleware/rateLimiters.js";
import { changePasswordSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAdmin, me);
router.post("/change-password", requireAdmin, passwordLimiter, validate(changePasswordSchema), changePassword);
router.post("/logout-all", requireAdmin, logoutAll);

export default router;