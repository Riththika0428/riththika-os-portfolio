import { Router } from "express";
import {
  getEducation,
  createEntry,
  updateEntry,
  deleteEntry,
  reorderEntries,
} from "../controllers/education.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { educationSchema, reorderSchema } from "../validators/education.validator.js";

const router = Router();

router.get("/", getEducation); // public

// "reorder" is declared before "/:id" so it isn't mistaken for an id
router.put("/reorder", requireAdmin, validate(reorderSchema), reorderEntries);
router.post("/", requireAdmin, validate(educationSchema), createEntry);
router.put("/:id", requireAdmin, validate(educationSchema), updateEntry);
router.delete("/:id", requireAdmin, deleteEntry);

export default router;