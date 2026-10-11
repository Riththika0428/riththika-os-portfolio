// Keep these two lists in sync with server/src/config/constants.js
export const PROJECT_CATEGORY_OPTIONS = ["Full Stack", "Frontend", "Backend", "UI/UX", "Other"];
export const PROJECT_STATUS_OPTIONS = ["Planned", "In Development", "Completed"];

export const EMPTY_PROJECT = {
  title: "",
  slug: "",
  category: "Full Stack",
  status: "",
  year: "",
  featured: false,
  order: "",
  shortDescription: "",
  description: "",
  image: "",
  githubUrl: "",
  liveUrl: "",
  stack: [],
  caseStudy: {
    overview: "",
    problem: "",
    goal: "",
    solution: "",
    features: [],
    results: [],
    screenshots: [],
    techStack: { frontend: [], backend: [], database: [] },
    architecture: { summary: "", layers: [] },
    metrics: [],
    process: [],
    challenges: [],
  },
};

export const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const rows = (list, keys) =>
  (list ?? []).map((r) => Object.fromEntries(keys.map((k) => [k, r?.[k] ?? ""])));

// API document -> form state (everything becomes a string/array the inputs can use)
export function toFormValues(p) {
  const cs = p.caseStudy ?? {};
  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    category: p.category ?? "Full Stack",
    status: p.status ?? "",
    year: p.year != null ? String(p.year) : "",
    featured: Boolean(p.featured),
    order: p.order != null ? String(p.order) : "",
    shortDescription: p.shortDescription ?? "",
    description: p.description ?? "",
    image: p.image ?? "",
    githubUrl: p.githubUrl ?? "",
    liveUrl: p.liveUrl ?? "",
    stack: p.stack ?? [],
    caseStudy: {
      overview: cs.overview ?? "",
      problem: cs.problem ?? "",
      goal: cs.goal ?? "",
      solution: cs.solution ?? "",
      features: cs.features ?? [],
      results: cs.results ?? [],
      screenshots: cs.screenshots ?? [],
      techStack: {
        frontend: cs.techStack?.frontend ?? [],
        backend: cs.techStack?.backend ?? [],
        database: cs.techStack?.database ?? [],
      },
      architecture: {
        summary: cs.architecture?.summary ?? "",
        layers: cs.architecture?.layers ?? [],
      },
      metrics: rows(cs.metrics, ["label", "value", "caption"]),
      process: rows(cs.process, ["title", "description"]),
      challenges: rows(cs.challenges, ["challenge", "solution"]),
    },
  };
}

const clean = (list) => list.map((s) => s.trim()).filter(Boolean);
const cleanRows = (list, keys) =>
  list
    .map((r) => Object.fromEntries(keys.map((k) => [k, (r[k] ?? "").trim()])))
    .filter((r) => keys.some((k) => r[k])); // fully empty rows are dropped

// Form state -> API payload
export function toPayload(v) {
  const cs = v.caseStudy;
  const year = v.year.trim();
  const order = v.order.trim();
  return {
    title: v.title.trim(),
    slug: v.slug.trim(),
    category: v.category,
    ...(v.status ? { status: v.status } : {}),
    year: year === "" ? null : Number(year),
    featured: v.featured,
    ...(order === "" ? {} : { order: Number(order) }),
    shortDescription: v.shortDescription.trim(),
    description: v.description.trim(),
    image: v.image.trim(),
    githubUrl: v.githubUrl.trim(),
    liveUrl: v.liveUrl.trim(),
    stack: clean(v.stack),
    caseStudy: {
      overview: cs.overview.trim(),
      problem: cs.problem.trim(),
      goal: cs.goal.trim(),
      solution: cs.solution.trim(),
      features: clean(cs.features),
      results: clean(cs.results),
      screenshots: clean(cs.screenshots),
      techStack: {
        frontend: clean(cs.techStack.frontend),
        backend: clean(cs.techStack.backend),
        database: clean(cs.techStack.database),
      },
      architecture: { summary: cs.architecture.summary.trim(), layers: clean(cs.architecture.layers) },
      metrics: cleanRows(cs.metrics, ["label", "value", "caption"]),
      process: cleanRows(cs.process, ["title", "description"]),
      challenges: cleanRows(cs.challenges, ["challenge", "solution"]),
    },
  };
}

const isHttpUrl = (s) => /^https?:\/\/\S+$/i.test(s);

// Returns { fieldName: "message" } (empty object = valid). The server validates again.
export function validateProject(v) {
  const e = {};
  if (!v.title.trim()) e.title = "Title is required.";

  const slug = v.slug.trim();
  if (!slug) e.slug = "Slug is required.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    e.slug = "Use lowercase letters, numbers and hyphens only.";

  if (!v.description.trim()) e.description = "Description is required.";

  if (v.year.trim() !== "") {
    const y = Number(v.year);
    if (!Number.isInteger(y) || y < 2000 || y > 2100) e.year = "Enter a year between 2000 and 2100.";
  }
  if (v.order.trim() !== "") {
    const o = Number(v.order);
    if (!Number.isInteger(o) || o < 0) e.order = "Use a whole number, 0 or higher.";
  }
  for (const key of ["githubUrl", "liveUrl"]) {
    const val = v[key].trim();
    if (val && !isHttpUrl(val)) e[key] = "Must be a full http(s) URL.";
  }
  const img = v.image.trim();
  if (img && !img.startsWith("/") && !isHttpUrl(img)) e.image = "Use a /public path or a full http(s) URL.";

  const badShot = v.caseStudy.screenshots.find((s) => s.trim() && !s.trim().startsWith("/") && !isHttpUrl(s.trim()));
  if (badShot !== undefined) e.screenshots = "Each screenshot must be a /public path or a full http(s) URL.";
  return e;
}