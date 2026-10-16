import { Router } from "express";
import { getProjectImage, uploadProjectImage, deleteProjectImage } from "../controllers/projectImage.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { uploadImage } from "../middleware/uploadImage.js";

const router = Router();

router.get("/:id", getProjectImage); // public: shown on the project cards
router.post("/", requireAdmin, uploadImage, uploadProjectImage); // requireAdmin first: no upload parsing for strangers
router.delete("/:id", requireAdmin, deleteProjectImage);

export default router;