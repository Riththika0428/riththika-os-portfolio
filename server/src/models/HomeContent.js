import mongoose from "mongoose";

export const HIGHLIGHT_ICONS = ["Layout", "Server", "PenTool", "Rocket", "Code2", "Database", "Wrench", "Sparkles"];

// The defaults are the text the Home page already shows, so nothing changes until you edit it.
export const HOME_DEFAULTS = {
  name: "Riththika",
  role: "Full Stack Developer",
  tagline: "I build clean, responsive and user-focused web applications that solve real-world problems.",
  heroImage: "",
  heroImageAlt: "",
  closingMessage: "Ready to build.",
  highlights: [
    { title: "Web Development", description: "Responsive, accessible interfaces built with React and Next.js.", icon: "Layout", href: "/skills" },
    { title: "Backend Development", description: "REST APIs and services with Node.js, Express, and MongoDB.", icon: "Server", href: "/skills" },
    { title: "UI / UX", description: "Clean, purposeful interfaces designed with real users in mind.", icon: "PenTool", href: "/skills" },
    { title: "Deployment", description: "Shipping and maintaining full-stack apps in production.", icon: "Rocket", href: "/projects" },
  ],
};

const highlightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Sparkles" },
    href: { type: String, default: "/skills" },
  },
  { _id: false }
);

/**
 * Singleton: one document holds the Home page hero text, the 3D image, the highlight
 * cards and the closing terminal line.
 * heroImage is "/api/project-images/<id>" (uploaded), a /public path, or an http(s) URL.
 * `highlights` stays undefined until first saved, so the built-in cards show until then;
 * saving an empty list hides the row on purpose.
 */
const homeContentSchema = new mongoose.Schema(
  {
    name: { type: String, default: HOME_DEFAULTS.name },
    role: { type: String, default: HOME_DEFAULTS.role },
    tagline: { type: String, default: HOME_DEFAULTS.tagline },
    heroImage: { type: String, default: "" },
    heroImageAlt: { type: String, default: "" },
    closingMessage: { type: String, default: HOME_DEFAULTS.closingMessage },
    highlights: { type: [highlightSchema], default: undefined },
  },
  { timestamps: true }
);

export const HomeContent = mongoose.model("HomeContent", homeContentSchema);