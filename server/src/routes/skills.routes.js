import { Router } from "express";
import { getSkills, categoryHandlers, proficiencyHandlers } from "../controllers/skills.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { skillCategorySchema, proficiencySchema, reorderSchema } from "../validators/skill.validator.js";

const router = Router();

router.get("/", getSkills); // public

router.put("/categories/reorder", requireAdmin, validate(reorderSchema), categoryHandlers.reorder);
router.post("/categories", requireAdmin, validate(skillCategorySchema), categoryHandlers.create);
router.put("/categories/:id", requireAdmin, validate(skillCategorySchema), categoryHandlers.update);
router.delete("/categories/:id", requireAdmin, categoryHandlers.remove);

router.put("/proficiencies/reorder", requireAdmin, validate(reorderSchema), proficiencyHandlers.reorder);
router.post("/proficiencies", requireAdmin, validate(proficiencySchema), proficiencyHandlers.create);
router.put("/proficiencies/:id", requireAdmin, validate(proficiencySchema), proficiencyHandlers.update);
router.delete("/proficiencies/:id", requireAdmin, proficiencyHandlers.remove);

export default router;