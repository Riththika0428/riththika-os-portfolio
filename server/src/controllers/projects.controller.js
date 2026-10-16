import { Project } from "../models/Project.js";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "../config/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { imageUrlsOf, removeImagesIfUnused } from "../utils/projectImages.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const assertValidId = (id) => {
  if (!OBJECT_ID.test(id)) throw new ApiError(400, "Invalid project id");
};
const rethrowDuplicateSlug = (err) => {
  if (err?.code === 11000) throw new ApiError(409, "A project with this slug already exists");
};

/* ---------- public ---------- */

export const getAllProjects = asyncHandler(async (_req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: 1 });
  res.json({
    success: true,
    data: { categories: PROJECT_CATEGORIES, statuses: PROJECT_STATUSES, projects },
  });
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) throw new ApiError(404, `No project found with slug "${req.params.slug}"`);
  res.json({ success: true, data: { project } });
});

/* ---------- admin (routes are guarded by requireAdmin) ---------- */

export const getProjectById = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  res.json({ success: true, data: { project } });
});

export const createProject = asyncHandler(async (req, res) => {
  // New projects go to the end of the list unless an order is given.
  if (req.body.order === undefined) {
    const last = await Project.findOne().sort({ order: -1 }).select("order");
    req.body.order = (last?.order ?? 0) + 1;
  }
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: { project } });
  } catch (err) {
    rethrowDuplicateSlug(err);
    throw err;
  }
});

export const updateProject = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  const imagesBefore = imageUrlsOf(project); // cover + screenshots
  project.set(req.body);
  try {
    await project.save();
  } catch (err) {
    rethrowDuplicateSlug(err);
    throw err;
  }
  // Covers or screenshots that were replaced or removed: delete the old uploaded files
  // (a no-op for /public paths and external URLs, and for images another project still uses).
  const imagesAfter = new Set(imageUrlsOf(project));
  await removeImagesIfUnused(imagesBefore.filter((url) => !imagesAfter.has(url)));
  res.json({ success: true, data: { project } });
});

export const patchProject = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!project) throw new ApiError(404, "Project not found");
  res.json({ success: true, data: { project } });
});

export const deleteProject = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  await removeImagesIfUnused(imageUrlsOf(project));
  res.json({ success: true, data: { id: project._id } });
});