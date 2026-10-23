import { z } from "zod";

export const learningSchema = z.object({
  intro: z.string().trim().min(1, "Intro text is required").max(500),
  tracks: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Track name is required").max(60),
        level: z.number().int().min(1).max(5),
      })
    )
    .max(12)
    .default([]),
});