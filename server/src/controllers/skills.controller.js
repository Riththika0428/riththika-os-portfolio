import { SkillCategory } from "../models/SkillCategory.js";
import { Proficiency } from "../models/Proficiency.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/* ---------- public ---------- */

export const getSkills = asyncHandler(async (_req, res) => {
  const [categories, coreProficiencies] = await Promise.all([
    SkillCategory.find().sort({ order: 1, createdAt: 1 }),
    Proficiency.find().sort({ order: 1, createdAt: 1 }),
  ]);
  res.json({ success: true, data: { categories, coreProficiencies } });
});

/* ---------- admin (routes are guarded by requireAdmin) ---------- */

const OBJECT_ID = /^[a-f\d]{24}$/i;
const assertValidId = (id) => {
  if (!OBJECT_ID.test(id)) throw new ApiError(400, "Invalid id");
};
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";

// Same CRUD for both models; keySource is the field the unique `key` is built from.
function adminHandlers(Model, label, keySource) {
  const rethrowDuplicate = (err) => {
    if (err?.code === 11000) throw new ApiError(409, `A ${label} with a very similar name already exists`);
  };

  return {
    create: asyncHandler(async (req, res) => {
      const last = await Model.findOne().sort({ order: -1 }).select("order");
      const doc = { ...req.body, key: slug(req.body[keySource]), order: (last?.order ?? 0) + 1 };
      try {
        const item = await Model.create(doc);
        res.status(201).json({ success: true, data: { item } });
      } catch (err) {
        rethrowDuplicate(err);
        throw err;
      }
    }),

    update: asyncHandler(async (req, res) => {
      assertValidId(req.params.id);
      const item = await Model.findById(req.params.id);
      if (!item) throw new ApiError(404, `${label} not found`);
      item.set(req.body); // `key` is never in the body, so it stays stable
      await item.save();
      res.json({ success: true, data: { item } });
    }),

    remove: asyncHandler(async (req, res) => {
      assertValidId(req.params.id);
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw new ApiError(404, `${label} not found`);
      res.json({ success: true, data: { id: item._id } });
    }),

    reorder: asyncHandler(async (req, res) => {
      await Model.bulkWrite(
        req.body.ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } }))
      );
      res.json({ success: true, data: null });
    }),
  };
}

export const categoryHandlers = adminHandlers(SkillCategory, "category", "title");
export const proficiencyHandlers = adminHandlers(Proficiency, "skill", "label");