import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// Only http(s) links, so "javascript:" URLs can never be stored.
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "must be a full http(s) URL")
  .default("");

// Drop duplicates (case-insensitive), keep the first spelling.
const dedupe = (list) => {
  const seen = new Set();
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const certificationSchema = z
  .object({
    title: text(160).min(1, "Certification name is required"),
    issuer: text(120).min(1, "Issuer is required"),
    issueDate: z.string().trim().regex(MONTH, "use the format YYYY-MM"),
    expiryDate: z
      .string()
      .trim()
      .regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, "use the format YYYY-MM")
      .default(""),
    credentialId: text(120).default(""),
    credentialUrl: httpUrl,
    description: text(600).default(""),
    skills: z.array(text(60).min(1)).max(20).default([]).transform(dedupe),
  })
  .refine((v) => !v.expiryDate || v.expiryDate >= v.issueDate, {
    message: "Expiry can't be before the issue date",
    path: ["expiryDate"],
  });

export const certificationReorderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "invalid id")).min(1).max(100),
});