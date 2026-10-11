import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { loginLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAdmin, me);

export default router;