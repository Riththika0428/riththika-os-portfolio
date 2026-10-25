/**
 * Lists every API route and checks that nothing is exposed by accident.
 *   npm run audit
 * Exits with code 1 if any route that is not on the PUBLIC list lacks requireAdmin,
 * or if a write route lacks request validation.
 */
import { pathToFileURL } from "node:url";
import { API_ROUTES } from "../app.js";

// Routes anyone may call. Everything else MUST sit behind requireAdmin.
export const PUBLIC = new Set([
  "GET /api/projects",
  "GET /api/projects/:slug",
  "GET /api/skills",
  "GET /api/education",
  "GET /api/about",
  "GET /api/resume",
  "GET /api/profile-image",
  "GET /api/project-images/:id",
  "GET /api/certifications",
  "GET /api/home",
  "GET /api/site-settings",
  "GET /api/learning",
  "POST /api/contact",
  "POST /api/auth/login",
  "POST /api/auth/logout",
]);
// Write routes that take no body, or validate it inside the controller.
const NO_VALIDATOR_NEEDED = new Set(["POST /api/contact/read-all", "POST /api/auth/login", "POST /api/auth/logout", "POST /api/auth/logout-all", "PUT /api/profile-image", "POST /api/project-images"]); // images are checked by multer limits + byte signature

export function collectRoutes(table) {
  const rows = [];
  for (const [mount, router] of table) {
    let guardedFromHere = false; // router.use(requireAdmin) protects everything declared after it
    for (const layer of router.stack) {
      if (!layer.route) {
        if (layer.handle?.guard === "admin") guardedFromHere = true;
        continue;
      }
      const handlers = layer.route.stack.map((l) => l.handle);
      for (const method of Object.keys(layer.route.methods)) {
        rows.push({
          method: method.toUpperCase(),
          path: (mount + (layer.route.path === "/" ? "" : layer.route.path)) || "/",
          admin: guardedFromHere || handlers.some((h) => h.guard === "admin"),
          validated: handlers.some((h) => h.guard === "validate"),
        });
      }
    }
  }
  return rows;
}

export function findProblems(rows) {
  const problems = [];
  for (const r of rows) {
    const id = `${r.method} ${r.path}`;
    const isPublic = PUBLIC.has(id);
    const isWrite = r.method !== "GET";
    if (!isPublic && !r.admin) problems.push(`${id} is reachable without login`);
    if (isPublic && !["GET", "POST"].includes(r.method)) problems.push(`${id} is public but is not GET/POST`);
    if (isWrite && r.method !== "DELETE" && !r.validated && !NO_VALIDATOR_NEEDED.has(id)) {
      problems.push(`${id} accepts a body but has no validate(...)`);
    }
  }
  return problems;
}

function main() {
  const rows = collectRoutes(API_ROUTES);
  const width = Math.max(...rows.map((r) => `${r.method} ${r.path}`.length));
  console.log(`${"ROUTE".padEnd(width)}  ACCESS   VALIDATED`);
  for (const r of rows) {
    const id = `${r.method} ${r.path}`;
    const access = r.admin ? "admin" : PUBLIC.has(id) ? "public" : "OPEN!";
    const valid = r.validated ? "yes" : r.method === "GET" || r.method === "DELETE" ? "-" : "no";
    console.log(`${id.padEnd(width)}  ${access.padEnd(7)}  ${valid}`);
  }
  const problems = findProblems(rows);
  console.log(problems.length ? `\n${problems.length} problem(s):\n - ${problems.join("\n - ")}` : `\nOK: ${rows.length} routes checked, no problems.`);
  process.exit(problems.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();