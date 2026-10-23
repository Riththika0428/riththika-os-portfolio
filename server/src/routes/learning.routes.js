import { Router } from "express";
import { getLearning, saveLearning } from "../controllers/learning.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { learningSchema } from "../validators/learning.validator.js";

const router = Router();

router.get("/", getLearning); // public
router.put("/", requireAdmin, validate(learningSchema), saveLearning);

export default router;