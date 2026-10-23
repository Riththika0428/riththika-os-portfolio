import { Router } from "express";
import { getSiteSettings, saveSiteSettings } from "../controllers/siteSettings.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { siteSettingsSchema } from "../validators/siteSettings.validator.js";

const router = Router();

router.get("/", getSiteSettings); // public
router.put("/", requireAdmin, validate(siteSettingsSchema), saveSiteSettings);

export default router;