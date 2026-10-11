import mongoose from "mongoose";

const skillCategorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    icon: String,
    skills: [String],
    highlight: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SkillCategory = mongoose.model("SkillCategory", skillCategorySchema);