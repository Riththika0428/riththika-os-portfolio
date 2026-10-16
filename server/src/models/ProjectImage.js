import mongoose from "mongoose";

/**
 * One uploaded project cover image. Stored in MongoDB (not on disk) so it survives
 * redeploys on hosts with an ephemeral filesystem. `data` is excluded from normal
 * queries; ask for it explicitly with .select("+data").
 * A project refers to it by URL: project.image = "/api/project-images/<_id>".
 */
const projectImageSchema = new mongoose.Schema(
  {
    contentType: { type: String, required: true, enum: ["image/jpeg", "image/png", "image/webp"] },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

export const ProjectImage = mongoose.model("ProjectImage", projectImageSchema);