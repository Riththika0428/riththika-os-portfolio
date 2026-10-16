const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const UPLOADED = /^\/api\/project-images\/([a-f\d]{24})$/i;

/** Id of an image uploaded through the admin panel, or null for /public paths and external URLs. */
export const uploadedImageId = (src) => (typeof src === "string" ? src.match(UPLOADED)?.[1] ?? null : null);

/**
 * Uploaded covers are stored as "/api/project-images/<id>", a path on the API server,
 * so they need the API address in front. /public paths and full URLs are used as they are.
 */
export const resolveImage = (src) => (uploadedImageId(src) ? `${API}${src}` : src);

/** next/image can't optimise images hosted elsewhere without extra config, so those load directly. */
export const isRemoteImage = (src) => /^https?:\/\//i.test(src || "");