import mongoose from "mongoose";

const skillGroupSchema = new mongoose.Schema(
  { key: String, label: String, items: [String] },
  { _id: false }
);
const achievementSchema = new mongoose.Schema(
  { title: String, description: { type: String, default: "" } },
  { _id: false }
);

/**
 * Singleton — the resume has one set of content, so this collection holds exactly one
 * document. Education and Projects are NOT stored here: the resume reads them live from
 * their own collections, so editing them in the admin updates the resume too.
 */
const resumeContentSchema = new mongoose.Schema(
  {
    headline: { type: String, default: "" },
    contact: {
      location: { type: String, default: "" },
      availability: { type: String, default: "" },
      email: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    skillGroups: [skillGroupSchema],
    experience: { type: String, default: "" },
    achievements: [achievementSchema],
    pdfUrl: { type: String, default: "" },
    projects: {
      mode: { type: String, enum: ["all", "selected"], default: "all" },
      slugs: [String],
    },
  },
  { timestamps: true }
);

export const ResumeContent = mongoose.model("ResumeContent", resumeContentSchema);