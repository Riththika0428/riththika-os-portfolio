import { ProfileImage } from "../models/ProfileImage.js";
import { AppError, asyncHandler } from "../utils/http.js";
import { sniffImageType } from "../middleware/uploadImage.js";

const META_FIELDS = "contentType size updatedAt";
const metaOf = (d) => ({ contentType: d.contentType, size: d.size, updatedAt: d.updatedAt });

// PUBLIC: the image bytes. 404 when no photo has been uploaded yet.
export const getProfileImage = asyncHandler(async (req, res) => {
  const meta = await ProfileImage.findOne().select(META_FIELDS);
  if (!meta) throw new AppError("No profile image", 404);

  res.set({
    "Cache-Control": "public, max-age=0, must-revalidate", // always re-check, so a new upload shows at once
    ETag: `W/"${meta.size}-${meta.updatedAt.getTime()}"`,
    "Last-Modified": meta.updatedAt.toUTCString(),
    // helmet's default is same-origin, which would block the site (another origin) from showing it
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  if (req.fresh) return res.status(304).end(); // browser already has this version

  const full = await ProfileImage.findOne().select("+data");
  if (!full) throw new AppError("No profile image", 404);
  res.type(full.contentType).send(full.data);
});

// ADMIN: details about the current photo (never the bytes).
export const getProfileImageMeta = asyncHandler(async (_req, res) => {
  const meta = await ProfileImage.findOne().select(META_FIELDS);
  res.json({ success: true, data: meta ? { exists: true, ...metaOf(meta) } : { exists: false } });
});

// ADMIN: upload or replace.
export const saveProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Choose an image to upload (field name "image").', 400);

  const type = sniffImageType(req.file.buffer);
  if (!type) throw new AppError("That file isn't a valid JPG, PNG or WebP image.", 400);

  const doc = await ProfileImage.findOneAndUpdate(
    {},
    { $set: { contentType: type, size: req.file.buffer.length, data: req.file.buffer } },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
  ).select(META_FIELDS);

  res.json({ success: true, data: { exists: true, ...metaOf(doc) } });
});

// ADMIN: remove the photo (the site falls back to initials).
export const deleteProfileImage = asyncHandler(async (_req, res) => {
  await ProfileImage.deleteMany({});
  res.json({ success: true, data: { exists: false } });
});