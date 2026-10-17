import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: String, required: true }, // "YYYY-MM"
    expiryDate: { type: String, default: "" }, // "YYYY-MM"; empty = does not expire
    credentialId: { type: String, default: "" },
    credentialUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    skills: [String],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Certification = mongoose.model("Certification", certificationSchema);