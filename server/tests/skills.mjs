process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const mongoose = (await import("mongoose")).default;
const { default: Admin } = await import("../src/models/Admin.js");
const { SkillCategory } = await import("../src/models/SkillCategory.js");
const { createApp, API_ROUTES } = await import("../src/app.js");
const { signAdminToken, COOKIE_NAME } = await import("../src/utils/authCookie.js");
const { collectRoutes, findProblems } = await import("../src/scripts/auditRoutes.js");

Admin.findById = async (id) => ({ _id: id });
SkillCategory.find = () => ({ sort: async () => [{ key: "frontend", title: "Frontend", icon: "Layout", skills: ["HTML"], highlight: false }] });
const app = createApp({ allowedOrigins: ["http://localhost:3000"] });
const server = app.listen(0); const base = `http://localhost:${server.address().port}`;
const cookie = `${COOKIE_NAME}=${signAdminToken({ _id: String(new mongoose.Types.ObjectId()) })}`;
const H = { "Content-Type": "application/json", "X-Requested-With": "riththika-admin", Origin: "http://localhost:3000", Cookie: cookie };
let fails = 0; const ok = (n, c) => { console.log(c ? "PASS" : "FAIL", n); if (!c) fails++; };
const id = String(new mongoose.Types.ObjectId());

const j = await (await fetch(`${base}/api/skills`)).json();
ok("GET /api/skills returns the categories", j.success && j.data.categories.length === 1);
ok("GET /api/skills no longer returns core proficiencies", !("coreProficiencies" in j.data));
for (const [m, p] of [["POST", "proficiencies"], ["PUT", "proficiencies/reorder"], ["PUT", `proficiencies/${id}`], ["DELETE", `proficiencies/${id}`]]) {
  const r = await fetch(`${base}/api/skills/${p}`, { method: m, headers: H, body: m === "DELETE" ? undefined : JSON.stringify({ label: "x", level: 3, ids: [id] }) });
  ok(`${m} /api/skills/${p.replace(id, ":id")} is gone (404)`, r.status === 404);
}
ok("category routes still protected (no login -> 401)", (await fetch(`${base}/api/skills/categories`, { method: "POST", headers: { ...H, Cookie: "" }, body: JSON.stringify({ title: "x" }) })).status === 401);
ok("category validation still works", (await fetch(`${base}/api/skills/categories`, { method: "POST", headers: H, body: JSON.stringify({ title: " " }) })).status === 400);
ok("audit passes", findProblems(collectRoutes(API_ROUTES)).length === 0);
server.close(); console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);