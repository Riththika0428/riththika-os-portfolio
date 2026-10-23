import mongoose from "mongoose";

// Contact details start EMPTY on purpose: nothing is invented, and the site hides any item
// that is empty. The sidebar texts default to what the sidebar already shows.
export const SITE_DEFAULTS = {
  email: "",
  phone: "",
  location: "Sri Lanka",
  github: "",
  linkedin: "",
  role: "Full Stack Developer",
  badge: "BIT Undergraduate",
  available: true,
  availabilityText: "Available for opportunities",
};

/** Singleton: one document holds the contact details, social links and sidebar profile text. */
const siteSettingsSchema = new mongoose.Schema(
  {
    email: { type: String, default: SITE_DEFAULTS.email },
    phone: { type: String, default: SITE_DEFAULTS.phone },
    location: { type: String, default: SITE_DEFAULTS.location },
    github: { type: String, default: SITE_DEFAULTS.github },
    linkedin: { type: String, default: SITE_DEFAULTS.linkedin },
    role: { type: String, default: SITE_DEFAULTS.role },
    badge: { type: String, default: SITE_DEFAULTS.badge },
    available: { type: Boolean, default: SITE_DEFAULTS.available },
    availabilityText: { type: String, default: SITE_DEFAULTS.availabilityText },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);