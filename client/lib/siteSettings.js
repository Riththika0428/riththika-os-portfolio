/**
 * Contact details, social links and sidebar profile text. They are edited in
 * Admin → Contact & profile and loaded from GET /api/site-settings.
 * Anything left empty is simply not shown, so there are never dead links.
 */
export const DEFAULT_SITE_SETTINGS = {
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

/** Fills gaps with the defaults, so a failed or partial response never breaks the layout. */
export function normalizeSettings(data) {
  const d = data && typeof data === "object" ? data : {};
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...Object.fromEntries(Object.entries(d).filter(([k, v]) => k in DEFAULT_SITE_SETTINGS && v != null)),
  };
}

const isHttp = (v) => /^https?:\/\//i.test(v);
const shortUrl = (v) => v.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
const phoneHref = (v) => `tel:${v.replace(/[^\d+]/g, "")}`;

/** Rows for the Contact page panel. Empty items are left out. */
export function contactMethods(s) {
  const rows = [];
  if (s.email) rows.push({ key: "email", label: "Email", value: s.email, href: `mailto:${s.email}`, icon: "Mail" });
  if (s.phone) rows.push({ key: "phone", label: "Phone", value: s.phone, href: phoneHref(s.phone), icon: "Phone" });
  if (s.location) rows.push({ key: "location", label: "Location", value: s.location, href: null, icon: "MapPin" });
  if (s.github && isHttp(s.github)) rows.push({ key: "github", label: "GitHub", value: shortUrl(s.github), href: s.github, icon: "Github" });
  if (s.linkedin && isHttp(s.linkedin)) rows.push({ key: "linkedin", label: "LinkedIn", value: shortUrl(s.linkedin), href: s.linkedin, icon: "Linkedin" });
  return rows;
}

/** Icons for the bottom of the sidebar. Empty items are left out. */
export function socialLinks(s) {
  const links = [];
  if (s.github && isHttp(s.github)) links.push({ key: "github", href: s.github });
  if (s.linkedin && isHttp(s.linkedin)) links.push({ key: "linkedin", href: s.linkedin });
  if (s.email) links.push({ key: "email", href: `mailto:${s.email}` });
  return links;
}