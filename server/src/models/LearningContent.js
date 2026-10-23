import mongoose from "mongoose";

export const LEARNING_DEFAULTS = {
  intro:
    "Development skills are continuously improved through personal projects, documentation, coding practice and real-world development.",
  tracks: [
    { label: "React", level: 4 },
    { label: "TypeScript", level: 3 },
    { label: "System Design", level: 2 },
  ],
};

const trackSchema = new mongoose.Schema(
  { label: { type: String, required: true }, level: { type: Number, min: 1, max: 5, default: 3 } },
  { _id: false }
);

/**
 * Singleton for the "Continuous Learning" box on the Education page.
 * `tracks` stays undefined until first saved (built-in tracks show until then);
 * saving an empty list hides the track list on purpose.
 */
const learningSchema = new mongoose.Schema(
  {
    intro: { type: String, default: LEARNING_DEFAULTS.intro },
    tracks: { type: [trackSchema], default: undefined },
  },
  { timestamps: true }
);

export const LearningContent = mongoose.model("LearningContent", learningSchema);