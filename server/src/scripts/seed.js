/**
 * One-time seed script — populates MongoDB from the in-memory data
 * files used in Phase 13 (src/data/*.data.js). Run this once after
 * connecting a real database so the app has real data to serve.
 *
 * Usage:  npm run seed
 *
 * Safe to re-run: it clears each collection before inserting, so it
 * won't create duplicates — but it WILL overwrite any edits made
 * directly in the database (e.g. through the admin dashboard in a
 * later phase). Don't run this against production data casually.
 */
if (!process.argv.includes("--force")) {
  console.error("Seed deletes ALL content collections. Re-run with --force if you really mean it.");
  process.exit(1);
}

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

import { Project } from "../models/Project.js";
import { EducationEntry } from "../models/EducationEntry.js";
import { SkillCategory } from "../models/SkillCategory.js";
import { AboutContent } from "../models/AboutContent.js";

import { projects } from "../data/projects.data.js";
import { EDUCATION_ENTRIES } from "../data/education.data.js";
import { SKILL_CATEGORIES, CORE_PROFICIENCIES } from "../data/skills.data.js";
import { INTRO_PARAGRAPHS, PROFILE_FIELDS, JOURNEY } from "../data/about.data.js";

dotenv.config();

async function seed() {
  await connectDB();

  console.log("[seed] Clearing existing collections...");
  await Promise.all([
    Project.deleteMany({}),
    EducationEntry.deleteMany({}),
    SkillCategory.deleteMany({}),
    Proficiency.deleteMany({}),
    AboutContent.deleteMany({}),
  ]);

  console.log("[seed] Inserting projects...");
  await Project.insertMany(
    projects.map((p, i) => ({ ...p, order: i }))
  );

  console.log("[seed] Inserting education entries...");
  await EducationEntry.insertMany(
    EDUCATION_ENTRIES.map((e, i) => ({ ...e, order: i }))
  );

  console.log("[seed] Inserting skill categories...");
  await SkillCategory.insertMany(
    SKILL_CATEGORIES.map((c, i) => ({ ...c, order: i }))
  );

  console.log("[seed] Inserting core proficiencies...");
  await Proficiency.insertMany(
    CORE_PROFICIENCIES.map((p, i) => ({ ...p, order: i }))
  );

  console.log("[seed] Inserting about content (singleton)...");
  await AboutContent.create({
    introParagraphs: INTRO_PARAGRAPHS,
    profileFields: PROFILE_FIELDS,
    journey: JOURNEY,
  });

  console.log("[seed] Done.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});