import { ResumeContent } from "../models/ResumeContent.js";
import { RESUME_DEFAULTS } from "../data/resume.defaults.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// `key` is only a React key on the public page: unique and never empty.
function withUniqueKeys(groups) {
  const used = new Set();
  return groups.map((g) => {
    const base = slug(g.label) || "group";
    let key = base;
    for (let n = 2; used.has(key); n++) key = `${base}-${n}`;
    used.add(key);
    return { ...g, key };
  });
}

const pick = (doc) => ({
  headline: doc.headline,
  contact: {
    location: doc.contact?.location ?? "",
    availability: doc.contact?.availability ?? "",
    email: doc.contact?.email ?? "",
    github: doc.contact?.github ?? "",
    linkedin: doc.contact?.linkedin ?? "",
  },
  summary: doc.summary,
  skillGroups: (doc.skillGroups ?? []).map((g) => ({ key: g.key, label: g.label, items: [...(g.items ?? [])] })),
  experience: doc.experience,
  achievements: (doc.achievements ?? []).map((a) => ({ title: a.title, description: a.description ?? "" })),
  pdfUrl: doc.pdfUrl ?? "",
  projects: { mode: doc.projects?.mode ?? "all", slugs: [...(doc.projects?.slugs ?? [])] },
});

/* ---------- public ---------- */

// Works on a brand-new database: until the first Save it serves the defaults.
export const getResume = asyncHandler(async (_req, res) => {
  const doc = await ResumeContent.findOne();
  res.json({ success: true, data: { ...pick(doc ?? RESUME_DEFAULTS), isDefault: !doc } });
});

/* ---------- admin (route is guarded by requireAdmin) ---------- */

export const saveResume = asyncHandler(async (req, res) => {
  const body = req.body;
  const update = {
    ...body,
    skillGroups: withUniqueKeys(body.skillGroups),
    // slugs only matter in "selected" mode; don't keep a stale list around
    projects: { mode: body.projects.mode, slugs: body.projects.mode === "selected" ? body.projects.slugs : [] },
  };
  const doc = await ResumeContent.findOneAndUpdate({}, { $set: update }, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json({ success: true, data: { ...pick(doc), isDefault: false } });
});