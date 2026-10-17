import { Router } from "express";
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  reorderCertifications,
} from "../controllers/certification.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { certificationSchema, certificationReorderSchema } from "../validators/certification.validator.js";

const router = Router();

router.get("/", getCertifications); // public

// "reorder" is declared before "/:id" so it isn't mistaken for an id
router.put("/reorder", requireAdmin, validate(certificationReorderSchema), reorderCertifications);
router.post("/", requireAdmin, validate(certificationSchema), createCertification);
router.put("/:id", requireAdmin, validate(certificationSchema), updateCertification);
router.delete("/:id", requireAdmin, deleteCertification);

export default router;