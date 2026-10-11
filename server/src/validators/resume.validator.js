import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const optText = (max) => text(max).default("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const email = z
  .string()
  .trim()
  .max(254)
  .refine((v) => v === "" || EMAIL_RE.test(v), "must be a valid email address")
  .default("");

// "https://github.com/me/" -> "github.com/me"  (shown as text on the resume, never as a link)
const handle = z
  .string()
  .trim()
  .max(100)
  .transform((v) => v.replace(/^https?:\/\//i, "").replace(/\/+$/, ""))
  .refine((v) => !/\s/.test(v), "can't contain spaces")
  .default("");

// A /public path ("/resume.pdf") or a full http(s) link. Blank = use the default /resume.pdf.
const pdfUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || (/^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/i.test(v)), "must be a /public path or a full http(s) link")
  .default("");

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const resumeSchema = z
  .object({
    headline: optText(120),
    contact: z
      .object({
        location: optText(80),
        availability: optText(80),
        email,
        github: handle,
        linkedin: handle,
      })
      .default({ location: "", availability: "", email: "", github: "", linkedin: "" }),
    summary: optText(1500),
    skillGroups: z
      .array(
        z.object({
          label: text(60).min(1, "Group name is required"),
          items: z.array(text(60).min(1)).max(30).default([]).transform(dedupe),
        })
      )
      .max(12)
      .default([]),
    experience: optText(2000),
    achievements: z
      .array(z.object({ title: text(120).min(1, "Title is required"), description: optText(300) }))
      .max(20)
      .default([]),
    pdfUrl,
    projects: z
      .object({
        mode: z.enum(["all", "selected"]).default("all"),
        slugs: z
          .array(z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid project slug"))
          .max(50)
          .default([])
          .transform(dedupe),
      })
      .default({ mode: "all", slugs: [] }),
  })
  .refine((v) => v.projects.mode === "all" || v.projects.slugs.length > 0, {
    message: "Choose at least one project, or switch to 'All projects'",
    path: ["projects"],
  });