import { EducationEntry } from "../models/EducationEntry.js";
import { EDUCATION_STATUS_COLORS } from "../config/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const assertValidId = (id) => {
  if (!OBJECT_ID.test(id)) throw new ApiError(400, "Invalid id");
};
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "entry";

// The status decides the badge colour and the "current" pulse, so they can never disagree.
const derive = (body) => ({
  ...body,
  statusColor: EDUCATION_STATUS_COLORS[body.status],
  current: body.status === "Currently Studying",
});

const rethrowDuplicate = (err) => {
  if (err?.code === 11000) {
    throw new ApiError(409, "An entry for this institution and degree already exists");
  }
};

/* ---------- public ---------- */

export const getEducation = asyncHandler(async (_req, res) => {
  const entries = await EducationEntry.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: { entries } });
});

/* ---------- admin (routes are guarded by requireAdmin) ---------- */

export const createEntry = asyncHandler(async (req, res) => {
  const last = await EducationEntry.findOne().sort({ order: -1 }).select("order");
  const doc = {
    ...derive(req.body),
    key: slug(`${req.body.institution} ${req.body.degree}`),
    order: (last?.order ?? 0) + 1,
  };
  try {
    const entry = await EducationEntry.create(doc);
    res.status(201).json({ success: true, data: { entry } });
  } catch (err) {
    rethrowDuplicate(err);
    throw err;
  }
});

export const updateEntry = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const entry = await EducationEntry.findById(req.params.id);
  if (!entry) throw new ApiError(404, "Education entry not found");
  entry.set(derive(req.body)); // `key` is never in the body, so public references stay stable
  await entry.save();
  res.json({ success: true, data: { entry } });
});

export const deleteEntry = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const entry = await EducationEntry.findByIdAndDelete(req.params.id);
  if (!entry) throw new ApiError(404, "Education entry not found");
  res.json({ success: true, data: { id: entry._id } });
});

export const reorderEntries = asyncHandler(async (req, res) => {
  await EducationEntry.bulkWrite(
    req.body.ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } }))
  );
  res.json({ success: true, data: null });
});