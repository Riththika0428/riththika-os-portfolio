import mongoose from "mongoose";

// The defaults are the text the Home page already shows, so nothing changes until you edit it.
export const HOME_DEFAULTS = {
  name: "Riththika",
  role: "Full Stack Developer",
  tagline: "I build clean, responsive and user-focused web applications that solve real-world problems.",
  heroImage: "",
  heroImageAlt: "",
};

/**
 * Singleton: one document holds the Home page hero text and the 3D image.
 * heroImage is "/api/project-images/<id>" (uploaded), a /public path, or an http(s) URL.
 */
const homeContentSchema = new mongoose.Schema(
  {
    name: { type: String, default: HOME_DEFAULTS.name },
    role: { type: String, default: HOME_DEFAULTS.role },
    tagline: { type: String, default: HOME_DEFAULTS.tagline },
    heroImage: { type: String, default: "" },
    heroImageAlt: { type: String, default: "" },
  },
  { timestamps: true }
);

export const HomeContent = mongoose.model("HomeContent", homeContentSchema);