import { Router } from "express";
import { getHome, saveHome } from "../controllers/home.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { homeSchema } from "../validators/home.validator.js";

const router = Router();

router.get("/", getHome); // public
router.put("/", requireAdmin, validate(homeSchema), saveHome);

export default router;