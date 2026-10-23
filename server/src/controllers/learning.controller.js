import { LearningContent, LEARNING_DEFAULTS } from "../models/LearningContent.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const pick = (doc) => ({
  intro: doc?.intro ?? LEARNING_DEFAULTS.intro,
  tracks: (doc?.tracks ?? LEARNING_DEFAULTS.tracks).map((t) => ({ label: t.label, level: t.level ?? 3 })),
});

/* ---------- public ---------- */

// Never 404s: before anything is saved the Education page shows its built-in text.
export const getLearning = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: pick(await LearningContent.findOne()) });
});

/* ---------- admin (route is guarded by requireAdmin) ---------- */

export const saveLearning = asyncHandler(async (req, res) => {
  const learning = await LearningContent.findOneAndUpdate({}, { $set: req.body }, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json({ success: true, data: pick(learning) });
});