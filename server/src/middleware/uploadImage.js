import multer from "multer";
import { AppError } from "../utils/http.js";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Memory storage: the file is held in RAM only for this request, then saved to MongoDB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0, parts: 2 },
  fileFilter(_req, file, cb) {
    // First, cheap check on what the browser claims. The real check is the byte signature below.
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new AppError("Only JPG, PNG or WebP images are allowed.", 400));
    }
    cb(null, true);
  },
}).single("image"); // the form field must be named "image"

/** Runs multer and turns its errors into friendly AppErrors. */
export function uploadImage(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof AppError) return next(err);
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError(`Image is too large. Maximum size is ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`, 413));
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError('Upload the file in a field named "image".', 400));
      }
      return next(new AppError("Invalid upload.", 400));
    }
    next(err);
  });
}

/** What the file really is, judged by its first bytes, never by its name or declared type. */
export function sniffImageType(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}