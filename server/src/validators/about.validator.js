import { z } from "zod";

const text = (max) => z.string().trim().max(max);

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const profileFieldSchema = z.object({
  label: text(40).min(1, "Label is required"),
  value: text(200).min(1, "Value is required"),
});

const journeySchema = z.object({
  year: text(20).min(1, "Year / label is required"),
  title: text(120).min(1, "Title is required"),
  description: text(600).default(""),
  tags: z.array(text(40).min(1)).max(12).default([]).transform(dedupe),
  now: z.boolean().default(false),
});

export const aboutSchema = z
  .object({
    introParagraphs: z.array(text(1500).min(1, "Paragraph can't be empty")).min(1, "Add at least one paragraph").max(10),
    profileFields: z.array(profileFieldSchema).max(20).default([]),
    journey: z.array(journeySchema).max(30).default([]),
  })
  .refine((v) => v.journey.filter((j) => j.now).length <= 1, {
    message: "Only one journey entry can be marked as NOW",
    path: ["journey"],
  });