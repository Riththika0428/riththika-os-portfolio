import { z } from "zod";
import { SKILL_ICON_OPTIONS } from "../config/constants.js";

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const skillCategorySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(60),
  icon: z.enum(SKILL_ICON_OPTIONS).default("Code2"),
  skills: z.array(z.string().trim().min(1).max(60)).max(40).default([]).transform(dedupe),
  highlight: z.boolean().default(false),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "invalid id")).min(1).max(100),
});