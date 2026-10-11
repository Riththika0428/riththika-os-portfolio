import { Router } from "express";
import {
  submitContactMessage,
  listMessages,
  setRead,
  markAllRead,
  deleteMessage,
} from "../controllers/contact.controller.js";
import { contactLimiter } from "../middleware/rateLimiters.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { contactSchema, readFlagSchema } from "../validators/contact.validator.js";

const router = Router();

router.post("/", contactLimiter, validate(contactSchema), submitContactMessage); // public

router.get("/", requireAdmin, listMessages);
// "read-all" is declared before "/:id" so it isn't mistaken for an id
router.post("/read-all", requireAdmin, markAllRead);
router.patch("/:id", requireAdmin, validate(readFlagSchema), setRead);
router.delete("/:id", requireAdmin, deleteMessage);

export default router;