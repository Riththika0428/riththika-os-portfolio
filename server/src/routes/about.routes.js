import { Router } from "express";
import { getAbout, saveAbout } from "../controllers/about.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { aboutSchema } from "../validators/about.validator.js";

const router = Router();

router.get("/", getAbout); // public
router.put("/", requireAdmin, validate(aboutSchema), saveAbout);

export default router;