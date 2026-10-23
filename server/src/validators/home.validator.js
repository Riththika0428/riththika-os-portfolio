import { z } from "zod";
import { HIGHLIGHT_ICONS } from "../models/HomeContent.js";

// A site path starts with one "/" ("//host/x" would point at another site).
const isSitePath = (v) => v.startsWith("/") && !v.startsWith("//");
const isHttpUrl = (v) => /^https?:\/\/\S+$/i.test(v);

const highlight = z.object({
  title: z.string().trim().min(1, "Card title is required").max(60),
  description: z.string().trim().max(160).default(""),
  icon: z.enum(HIGHLIGHT_ICONS).default("Sparkles"),
  href: z
    .string()
    .trim()
    .max(300)
    .refine((v) => isSitePath(v) || isHttpUrl(v), "must be a site path like /projects or an http(s) URL"),
});

export const homeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  role: z.string().trim().min(1, "Role is required").max(100),
  tagline: z.string().trim().min(1, "Tagline is required").max(300),
  heroImage: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || isSitePath(v) || isHttpUrl(v), "must be a /public path or http(s) URL")
    .default(""),
  heroImageAlt: z.string().trim().max(160).default(""),
  // Optional: leaving them out of a save leaves the stored values alone.
  closingMessage: z.string().trim().min(1, "Closing message is required").max(120).optional(),
  highlights: z.array(highlight).max(8).optional(),
});