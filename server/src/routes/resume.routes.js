import { Router } from "express";
import { getResume, saveResume } from "../controllers/resume.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { resumeSchema } from "../validators/resume.validator.js";

const router = Router();

router.get("/", getResume); // public
router.put("/", requireAdmin, validate(resumeSchema), saveResume);

export default router;