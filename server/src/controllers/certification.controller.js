import { Certification } from "../models/Certification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const assertValidId = (id) => {
  if (!OBJECT_ID.test(id)) throw httpError(400, "Invalid id");
};

/* ---------- public ---------- */

export const getCertifications = asyncHandler(async (_req, res) => {
  const certifications = await Certification.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: { certifications } });
});

/* ---------- admin (routes are guarded by requireAdmin) ---------- */

export const createCertification = asyncHandler(async (req, res) => {
  const last = await Certification.findOne().sort({ order: -1 }).select("order");
  const certification = await Certification.create({ ...req.body, order: (last?.order ?? 0) + 1 });
  res.status(201).json({ success: true, data: { certification } });
});

export const updateCertification = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const certification = await Certification.findById(req.params.id);
  if (!certification) throw httpError(404, "Certification not found");
  certification.set(req.body);
  await certification.save();
  res.json({ success: true, data: { certification } });
});

export const deleteCertification = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const certification = await Certification.findByIdAndDelete(req.params.id);
  if (!certification) throw httpError(404, "Certification not found");
  res.json({ success: true, data: { id: certification._id } });
});

export const reorderCertifications = asyncHandler(async (req, res) => {
  await Certification.bulkWrite(
    req.body.ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } }))
  );
  res.json({ success: true, data: null });
});