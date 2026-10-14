import { Router } from "express";
import {
  getProfileImage,
  getProfileImageMeta,
  saveProfileImage,
  deleteProfileImage,
} from "../controllers/profileImage.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { uploadImage } from "../middleware/uploadImage.js";

const router = Router();

router.get("/", getProfileImage); // public: the photo itself
router.get("/meta", requireAdmin, getProfileImageMeta);
router.put("/", requireAdmin, uploadImage, saveProfileImage); // requireAdmin first: no upload parsing for strangers
router.delete("/", requireAdmin, deleteProfileImage);

export default router;