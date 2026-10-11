import { AboutContent } from "../models/AboutContent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// `key` is only used by the public pages as a React key, so it must be unique and non-empty.
function withUniqueKeys(items, source, fallback) {
  const used = new Set();
  return items.map((item) => {
    const base = slug(source(item)) || fallback;
    let key = base;
    for (let n = 2; used.has(key); n++) key = `${base}-${n}`;
    used.add(key);
    return { ...item, key };
  });
}

const pick = (about) => ({
  introParagraphs: about.introParagraphs,
  profileFields: about.profileFields,
  journey: about.journey,
});

/* ---------- public ---------- */

export const getAbout = asyncHandler(async (_req, res) => {
  const about = await AboutContent.findOne();
  if (!about) throw new ApiError(404, "About content has not been seeded yet — run `npm run seed`.");
  res.json({ success: true, data: pick(about) });
});

/* ---------- admin (route is guarded by requireAdmin) ---------- */

// Singleton: replace the whole document, creating it the first time.
export const saveAbout = asyncHandler(async (req, res) => {
  const { introParagraphs, profileFields, journey } = req.body;
  const update = {
    introParagraphs,
    profileFields: withUniqueKeys(profileFields, (f) => f.label, "field"),
    journey: withUniqueKeys(journey, (j) => j.year, "entry"),
  };
  const about = await AboutContent.findOneAndUpdate({}, { $set: update }, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json({ success: true, data: pick(about) });
});