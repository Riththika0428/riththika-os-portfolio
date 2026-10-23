import { HomeContent, HOME_DEFAULTS } from "../models/HomeContent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeImagesIfUnused } from "../utils/projectImages.js";

const pick = (doc) => ({
  name: doc?.name ?? HOME_DEFAULTS.name,
  role: doc?.role ?? HOME_DEFAULTS.role,
  tagline: doc?.tagline ?? HOME_DEFAULTS.tagline,
  heroImage: doc?.heroImage ?? HOME_DEFAULTS.heroImage,
  heroImageAlt: doc?.heroImageAlt ?? HOME_DEFAULTS.heroImageAlt,
  closingMessage: doc?.closingMessage ?? HOME_DEFAULTS.closingMessage,
  // Not saved yet -> the built-in cards; saved as an empty list -> no cards.
  highlights: (doc?.highlights ?? HOME_DEFAULTS.highlights).map((h) => ({
    title: h.title,
    description: h.description ?? "",
    icon: h.icon ?? "Sparkles",
    href: h.href ?? "/skills",
  })),
});

/* ---------- public ---------- */

// Never 404s: before anything is saved the Home page shows its built-in text.
export const getHome = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: pick(await HomeContent.findOne()) });
});

/* ---------- admin (route is guarded by requireAdmin) ---------- */

export const saveHome = asyncHandler(async (req, res) => {
  const before = await HomeContent.findOne().select("heroImage");
  const home = await HomeContent.findOneAndUpdate({}, { $set: req.body }, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  // The old uploaded picture is deleted once nothing uses it any more.
  if (before?.heroImage && before.heroImage !== home.heroImage) await removeImagesIfUnused([before.heroImage]);
  res.json({ success: true, data: pick(home) });
});