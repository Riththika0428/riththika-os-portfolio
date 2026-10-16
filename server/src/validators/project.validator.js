import { z } from "zod";
import { PROJECT_CATEGORY_OPTIONS, PROJECT_STATUSES } from "../config/constants.js";

const text = (max) => z.string().trim().max(max);
const optText = (max) => text(max).default("");
const list = (maxItems, maxLen) => z.array(text(maxLen).min(1)).max(maxItems).default([]);
const withDefaults = (shape) => z.preprocess((v) => v ?? {}, z.object(shape));

// Only http(s) links, so "javascript:" URLs can never be stored.
const isHttpUrl = (v) => /^https?:\/\/\S+$/i.test(v);
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isHttpUrl(v), "must be a full http(s) URL")
  .default("");

// A site path starts with one "/" ("//host/x" would point at another site).
const isSitePath = (v) => v.startsWith("/") && !v.startsWith("//");

const pathOrUrl = text(500).refine(
  (v) => isSitePath(v) || isHttpUrl(v),
  "must be a /public path or http(s) URL"
);
const imageRef = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isSitePath(v) || isHttpUrl(v), "must be a /public path or http(s) URL")
  .default("")
  .transform((v) => v || null);

const caseStudySchema = withDefaults({
  metrics: z
    .array(z.object({ label: text(60).min(1), value: text(60).min(1), caption: optText(120) }))
    .max(8)
    .default([]),
  overview: optText(3000),
  problem: optText(3000),
  goal: optText(3000),
  solution: optText(3000),
  features: list(30, 300),
  techStack: withDefaults({ frontend: list(30, 60), backend: list(30, 60), database: list(30, 60) }),
  architecture: withDefaults({ summary: optText(2000), layers: list(12, 120) }),
  process: z
    .array(z.object({ title: text(120).min(1), description: optText(1000) }))
    .max(20)
    .default([]),
  challenges: z
    .array(z.object({ challenge: text(500).min(1), solution: text(1000).min(1) }))
    .max(20)
    .default([]),
  results: list(20, 300),
  screenshots: z.array(pathOrUrl).max(20).default([]),
});

export const projectSchema = z.object({
  title: text(120).min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase letters, numbers and hyphens only"),
  category: z.enum(PROJECT_CATEGORY_OPTIONS),
  status: z.enum(PROJECT_STATUSES).optional(),
  year: z.number().int().min(2000).max(2100).nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).max(10000).optional(),
  shortDescription: optText(240),
  description: text(1000).min(1, "Description is required"),
  image: imageRef,
  githubUrl: httpUrl,
  liveUrl: httpUrl,
  stack: list(30, 60),
  caseStudy: caseStudySchema,
});

// Quick edits from the list page (star, status).
export const projectPatchSchema = z
  .object({
    featured: z.boolean().optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
    order: z.number().int().min(0).max(10000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");