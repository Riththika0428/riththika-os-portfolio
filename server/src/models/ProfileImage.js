import mongoose from "mongoose";
import { Certification } from "../models/Certification.js";

/**
 * Singleton: the profile photo. Stored in MongoDB (not on disk) so it survives
 * redeploys on hosts with an ephemeral filesystem. `data` is excluded from normal
 * queries; ask for it explicitly with .select("+data").
 */
const profileImageSchema = new mongoose.Schema(
  {
    contentType: { type: String, required: true, enum: ["image/jpeg", "image/png", "image/webp"] },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

export const ProfileImage = mongoose.model("ProfileImage", profileImageSchema);