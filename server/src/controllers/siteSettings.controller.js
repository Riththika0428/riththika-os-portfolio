import { SiteSettings, SITE_DEFAULTS } from "../models/SiteSettings.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const pick = (doc) => ({
  email: doc?.email ?? SITE_DEFAULTS.email,
  phone: doc?.phone ?? SITE_DEFAULTS.phone,
  location: doc?.location ?? SITE_DEFAULTS.location,
  github: doc?.github ?? SITE_DEFAULTS.github,
  linkedin: doc?.linkedin ?? SITE_DEFAULTS.linkedin,
  role: doc?.role ?? SITE_DEFAULTS.role,
  badge: doc?.badge ?? SITE_DEFAULTS.badge,
  available: doc?.available ?? SITE_DEFAULTS.available,
  availabilityText: doc?.availabilityText ?? SITE_DEFAULTS.availabilityText,
});

/* ---------- public ---------- */

// Never 404s: before anything is saved the site shows the defaults (no contact details).
export const getSiteSettings = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: pick(await SiteSettings.findOne()) });
});

/* ---------- admin (route is guarded by requireAdmin) ---------- */

export const saveSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneAndUpdate({}, { $set: req.body }, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json({ success: true, data: pick(settings) });
});