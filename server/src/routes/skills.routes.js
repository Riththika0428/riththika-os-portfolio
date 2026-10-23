import { Router } from "express";
import { getSkills, categoryHandlers } from "../controllers/skills.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { skillCategorySchema, reorderSchema } from "../validators/skill.validator.js";

const router = Router();

router.get("/", getSkills);

router.put("/categories/reorder", requireAdmin, validate(reorderSchema), categoryHandlers.reorder);
router.post("/categories", requireAdmin, validate(skillCategorySchema), categoryHandlers.create);
router.put("/categories/:id", requireAdmin, validate(skillCategorySchema), categoryHandlers.update);
router.delete("/categories/:id", requireAdmin, categoryHandlers.remove);

export default router;