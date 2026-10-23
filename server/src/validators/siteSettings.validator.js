import { z } from "zod";

// Optional text: an empty string means "not set" and the site hides it.
const optional = (schema) => z.union([z.literal(""), schema]).default("");

const httpUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(v), "must be a full http(s) URL");

export const siteSettingsSchema = z.object({
  email: optional(z.string().trim().max(120).email("must be a valid email address")),
  phone: optional(
    z
      .string()
      .trim()
      .max(30)
      .regex(/^\+?[\d\s()-]{5,30}$/, "use digits, spaces, + ( ) and - only")
  ),
  location: z.string().trim().max(80).default(""),
  github: optional(httpUrl),
  linkedin: optional(httpUrl),
  role: z.string().trim().min(1, "Role is required").max(100),
  badge: z.string().trim().max(60).default(""),
  available: z.boolean().default(true),
  availabilityText: z.string().trim().max(60).default(""),
});