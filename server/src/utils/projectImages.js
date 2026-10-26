import { ProjectImage } from "../models/ProjectImage.js";
import { Project } from "../models/Project.js";
import { Certification } from "../models/Certification.js";
import { HomeContent } from "../models/HomeContent.js";

export const IMAGE_URL_PREFIX = "/api/project-images/";
const UPLOADED = /^\/api\/project-images\/([a-f\d]{24})$/i;

/** "/api/project-images/<id>" -> "<id>"; anything else (public paths, external URLs) -> null. */
export const uploadedImageId = (url) => (typeof url === "string" ? url.match(UPLOADED)?.[1] ?? null : null);

/** Every image URL a project uses: the cover plus the case-study screenshots. */
export const imageUrlsOf = (project) =>
  [project?.image, ...Array.from(project?.caseStudy?.screenshots ?? [])].filter(Boolean);

/** True when a project (cover or screenshot), a certification or the Home page uses this URL. */
export const isImageInUse = async (url) =>
  Boolean(
    (await Project.exists({ $or: [{ image: url }, { "caseStudy.screenshots": url }] })) ||
      (await Certification.exists({ image: url })) ||
      (await HomeContent.exists({ heroImage: url }))
  );

/** Delete uploaded images that no project uses any more. Never throws: cleanup must not fail a save. */
export async function removeImagesIfUnused(urls) {
  for (const url of new Set(urls)) {
    try {
      const id = uploadedImageId(url);
      if (!id) continue; // /public paths and external URLs are not ours to delete
      if (await isImageInUse(url)) continue;
      await ProjectImage.deleteOne({ _id: id });
    } catch (err) {
      console.error("project image cleanup failed:", err.message);
    }
  }
}

const ORPHAN_AFTER_MS = 60 * 60 * 1000; // an upload nobody saved within an hour is abandoned

/** Delete uploaded images that no project uses and that are older than an hour. Never throws. */
export async function sweepOrphans(now = Date.now()) {
  try {
    const old = await ProjectImage.find({ createdAt: { $lt: new Date(now - ORPHAN_AFTER_MS) } }).select("_id");
    if (old.length === 0) return 0;
    const used = [
      ...(await Project.distinct("image")),
      ...(await Project.distinct("caseStudy.screenshots")),
      ...(await Certification.distinct("image")),
      ...(await HomeContent.distinct("heroImage")),
    ];
    const inUse = new Set(used.map(uploadedImageId).filter(Boolean));
    const orphanIds = old.map((d) => String(d._id)).filter((id) => !inUse.has(id));
    if (orphanIds.length) await ProjectImage.deleteMany({ _id: { $in: orphanIds } });
    return orphanIds.length;
  } catch (err) {
    console.error("orphan sweep failed:", err.message);
    return 0;
  }
}