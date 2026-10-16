import { ProjectImage } from "../models/ProjectImage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { sniffImageType } from "../middleware/uploadImage.js";
import { IMAGE_URL_PREFIX, isImageInUse, sweepOrphans } from "../utils/projectImages.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const assertValidId = (id) => {
  if (!OBJECT_ID.test(id)) throw httpError(400, "Invalid image id");
};

// PUBLIC: the image bytes. Every upload gets a new id, so a given URL never changes
// and browsers may cache it for a long time.
export const getProjectImage = asyncHandler(async (req, res) => {
  if (!OBJECT_ID.test(req.params.id)) throw httpError(404, "Image not found");
  const img = await ProjectImage.findById(req.params.id).select("+data");
  if (!img) throw httpError(404, "Image not found");

  res.set({
    "Cache-Control": "public, max-age=31536000, immutable",
    // helmet's default is same-origin, which would block the site (another origin) from showing it
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  res.type(img.contentType).send(img.data);
});

// ADMIN: upload an image (cover or screenshot). Returns the URL to store on the project.
export const uploadProjectImage = asyncHandler(async (req, res) => {
  if (!req.file) throw httpError(400, 'Choose an image to upload (field name "image").');

  const type = sniffImageType(req.file.buffer);
  if (!type) throw httpError(400, "That file isn't a valid JPG, PNG or WebP image.");

  const doc = await ProjectImage.create({ contentType: type, size: req.file.buffer.length, data: req.file.buffer });
  res.status(201).json({
    success: true,
    data: { id: String(doc._id), url: `${IMAGE_URL_PREFIX}${doc._id}`, contentType: doc.contentType, size: doc.size },
  });

  sweepOrphans(); // housekeeping after the response, so it never slows or fails the upload
});

// ADMIN: discard an image that was uploaded but never saved on a project.
export const deleteProjectImage = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  if (await isImageInUse(`${IMAGE_URL_PREFIX}${req.params.id}`)) {
    throw httpError(409, "That image is used by a project. Remove it from the project instead.");
  }
  await ProjectImage.deleteOne({ _id: req.params.id });
  res.json({ success: true, data: { id: req.params.id } });
});