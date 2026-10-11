import { Router } from "express";
import {
  getAllProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  patchProject,
  deleteProject,
} from "../controllers/projects.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { projectSchema, projectPatchSchema } from "../validators/project.validator.js";

const router = Router();

// public
router.get("/", getAllProjects);

// admin (must come before "/:slug")
router.get("/id/:id", requireAdmin, getProjectById);
router.post("/", requireAdmin, validate(projectSchema), createProject);
router.put("/:id", requireAdmin, validate(projectSchema), updateProject);
router.patch("/:id", requireAdmin, validate(projectPatchSchema), patchProject);
router.delete("/:id", requireAdmin, deleteProject);

// public
router.get("/:slug", getProjectBySlug);

export default router;