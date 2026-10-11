import { z } from "zod";
import { EDUCATION_STATUS_COLORS } from "../config/constants.js";

const text = (max) => z.string().trim().max(max);
const month = z
  .string()
  .trim()
  .regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, "use the format YYYY-MM")
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

export const educationSchema = z
  .object({
    institution: text(120).min(1, "Institution is required"),
    degree: text(160).min(1, "Degree is required"),
    tag: text(60).default(""),
    status: z.enum(Object.keys(EDUCATION_STATUS_COLORS)),
    startDate: month,
    endDate: month,
    description: text(1000).default(""),
    subjects: z.array(text(60).min(1)).max(30).default([]).transform(dedupe),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "End date can't be before the start date",
    path: ["endDate"],
  });

export const reorderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "invalid id")).min(1).max(100),
});