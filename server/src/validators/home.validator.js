import { z } from "zod";

// A site path starts with one "/" ("//host/x" would point at another site).
const isSitePath = (v) => v.startsWith("/") && !v.startsWith("//");

export const homeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  role: z.string().trim().min(1, "Role is required").max(100),
  tagline: z.string().trim().min(1, "Tagline is required").max(300),
  heroImage: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || isSitePath(v) || /^https?:\/\/\S+$/i.test(v), "must be a /public path or http(s) URL")
    .default(""),
  heroImageAlt: z.string().trim().max(160).default(""),
});