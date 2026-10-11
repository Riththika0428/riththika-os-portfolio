import mongoose from "mongoose";

const educationEntrySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    tag: String,
    status: String,
    statusColor: String,
    current: { type: Boolean, default: false },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    startDate: { type: String, default: "" }, // "YYYY-MM"
    endDate: { type: String, default: "" }, // "YYYY-MM"; empty = ongoing
    description: String,
    subjects: [String],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EducationEntry = mongoose.model("EducationEntry", educationEntrySchema);