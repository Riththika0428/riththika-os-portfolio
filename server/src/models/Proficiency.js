import mongoose from "mongoose";

const proficiencySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    level: { type: Number, min: 1, max: 5, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Proficiency = mongoose.model("Proficiency", proficiencySchema);