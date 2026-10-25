/**
 * Fills the database with the starter content in src/data/*.data.js.
 *
 *   npm run seed                 SAFE: only fills collections that are empty.
 *                                Anything already in the database is left alone.
 *   npm run seed -- --force      Wipes and re-creates the collections listed below.
 *                                You must type the database name to confirm.
 *
 * Never touched, with or without --force: contact messages and the admin account.
 */
import "dotenv/config";
import readline from "node:readline/promises";
import { pathToFileURL } from "node:url";
import mongoose from "mongoose";

/** Decide what to do with each collection. Pure function, so it can be tested. */
export function planSeed(targets, counts, force) {
  return targets.map((t) => {
    const existing = counts[t.name] ?? 0;
    if (existing === 0) return { name: t.name, action: "insert", existing };
    return { name: t.name, action: force ? "replace" : "skip", existing };
  });
}

export async function seedDatabase(targets, force, log = console.log) {
  const counts = {};
  for (const t of targets) counts[t.name] = await t.model.countDocuments();
  const plan = planSeed(targets, counts, force);

  for (const step of plan) {
    const target = targets.find((t) => t.name === step.name);
    if (step.action === "skip") {
      log(`[seed] ${step.name}: skipped (${step.existing} already in the database)`);
      continue;
    }
    if (step.action === "replace") await target.model.deleteMany({});
    await target.model.insertMany(target.docs);
    log(`[seed] ${step.name}: ${step.action === "replace" ? "replaced" : "added"} ${target.docs.length}`);
  }
  return plan;
}

async function main() {
  const force = process.argv.includes("--force");

  const { connectDB } = await import("../config/db.js");
  const [{ Project }, { EducationEntry }, { SkillCategory }, { AboutContent }] = await Promise.all([
    import("../models/Project.js"),
    import("../models/EducationEntry.js"),
    import("../models/SkillCategory.js"),
    import("../models/AboutContent.js"),
  ]);
  const { projects } = await import("../data/projects.data.js");
  const { EDUCATION_ENTRIES } = await import("../data/education.data.js");
  const { SKILL_CATEGORIES } = await import("../data/skills.data.js");
  const { INTRO_PARAGRAPHS, PROFILE_FIELDS, JOURNEY } = await import("../data/about.data.js");

  const withOrder = (list) => list.map((item, i) => ({ ...item, order: i }));
  const targets = [
    { name: "projects", model: Project, docs: withOrder(projects) },
    { name: "education", model: EducationEntry, docs: withOrder(EDUCATION_ENTRIES) },
    { name: "skill categories", model: SkillCategory, docs: withOrder(SKILL_CATEGORIES) },
    { name: "about page", model: AboutContent, docs: [{ introParagraphs: INTRO_PARAGRAPHS, profileFields: PROFILE_FIELDS, journey: JOURNEY }] },
  ];

  await connectDB();
  const dbName = mongoose.connection.name;
  console.log(`[seed] database: "${dbName}" on ${mongoose.connection.host}`);

  if (force) {
    const counts = {};
    for (const t of targets) counts[t.name] = await t.model.countDocuments();
    const doomed = planSeed(targets, counts, true).filter((s) => s.action === "replace");
    if (doomed.length > 0) {
      console.log("\n[seed] --force will DELETE and replace:");
      doomed.forEach((s) => console.log(`         - ${s.name} (${s.existing} existing)`));
      if (!process.stdin.isTTY) {
        console.error("\n[seed] Refusing to wipe data without an interactive confirmation. Aborted.");
        await mongoose.disconnect();
        process.exit(1);
      }
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const typed = (await rl.question(`\nType the database name ("${dbName}") to continue: `)).trim();
      rl.close();
      if (typed !== dbName) {
        console.log("[seed] Name did not match. Nothing was changed.");
        await mongoose.disconnect();
        process.exit(1);
      }
    }
  }

  await seedDatabase(targets, force);
  if (!force) console.log("[seed] Done. (Use `npm run seed -- --force` to replace content that already exists.)");
  await mongoose.disconnect();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("[seed] Failed:", err.message);
    process.exit(1);
  });
}