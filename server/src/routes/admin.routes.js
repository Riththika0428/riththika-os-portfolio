import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { getStats } from "../controllers/admin.controller.js";

const router = Router();

// Everything under /api/admin requires a valid admin session.
router.use(requireAdmin);
router.get("/stats", getStats);

export default router;