process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const { default: Admin } = await import("../src/models/Admin.js");
const { ResumeContent } = await import("../src/models/ResumeContent.js");
const { createApp } = await import("../src/app.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");

Admin.findById = async (id) => ({ _id: id });
let doc = null, lastOpts = null;
ResumeContent.findOne = async () => doc;
ResumeContent.findOneAndUpdate = async (_f, update, opts) => {
  lastOpts = opts;
  if (!doc) doc = new ResumeContent({});
  doc.set(update.$set);
  const err = doc.validateSync();
  if (err) throw err;
  return doc;
};

const CLIENT = "http://localhost:3000";
const app = createApp({ allowedOrigins: [CLIENT] });
const base = await new Promise((r) => { const s = app.listen(0, () => r(`http://127.0.0.1:${s.address().port}`)); });
const cookie = `admin_token=${signAdminToken("507f1f77bcf86cd799439011")}`;
const call = async (method, body, auth = true) => {
  const res = await fetch(`${base}/api/resume`, {
    method,
    headers: { "Content-Type": "application/json", "X-Requested-With": "riththika-admin", Origin: CLIENT, ...(auth ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};
let fails = 0;
const check = (name, ok, extra = "") => { console.log(ok ? "PASS" : "FAIL", name, extra); if (!ok) fails++; };

const valid = {
  headline: "  Full Stack Developer  ",
  contact: { location: "Sri Lanka", availability: "Open to work", email: "me@example.com", github: "https://github.com/riththi/", linkedin: "linkedin.com/in/riththi" },
  summary: "Summary text",
  skillGroups: [
    { label: "Frontend", items: ["React", "react", " Next.js "] },
    { label: "Frontend", items: ["Tailwind"] },
    { label: "Backend", items: [] },
  ],
  experience: "Learning by building.",
  achievements: [{ title: "Dean's list", description: "2025" }],
  pdfUrl: "https://example.com/files/cv.pdf",
  projects: { mode: "selected", slugs: ["Eventra", "taskflow", "eventra"] },
};

let r = await call("GET", undefined, false);
check("fresh database: public GET serves the defaults (never 404)", r.status === 200 && r.json.data.isDefault === true && r.json.data.skillGroups.length === 4 && /Moratuwa/.test(r.json.data.summary), r.status);
check("defaults hide GitHub/LinkedIn/email (no placeholders)", r.json.data.contact.github === "" && r.json.data.contact.linkedin === "" && r.json.data.contact.email === "");
check("defaults show everything on the resume (projects mode all)", r.json.data.projects.mode === "all");

r = await call("PUT", valid, false);
check("PUT without login -> 401", r.status === 401);

r = await call("PUT", valid);
check("valid PUT -> 200 (creates the singleton)", r.status === 200 && r.json.data.isDefault === false, r.status);
check("upsert + returnDocument:after + runValidators", lastOpts.upsert && lastOpts.returnDocument === "after" && lastOpts.runValidators);
const d = r.json.data;
check("text trimmed", d.headline === "Full Stack Developer");
check("github URL reduced to a handle", d.contact.github === "github.com/riththi");
check("skill items deduped + trimmed", JSON.stringify(d.skillGroups[0].items) === '["React","Next.js"]', JSON.stringify(d.skillGroups[0].items));
check("skill group keys unique", d.skillGroups.map((g) => g.key).join() === "frontend,frontend-2,backend", d.skillGroups.map((g) => g.key).join());
check("project slugs lower-cased + deduped", JSON.stringify(d.projects) === '{"mode":"selected","slugs":["eventra","taskflow"]}', JSON.stringify(d.projects));
check("achievements saved", d.achievements[0].title === "Dean's list");

r = await call("GET", undefined, false);
check("public GET now returns the saved content", r.json.data.isDefault === false && r.json.data.contact.email === "me@example.com" && r.json.data.pdfUrl.endsWith("cv.pdf"));

r = await call("PUT", { ...valid, projects: { mode: "all", slugs: ["eventra"] } });
check("switching to 'all' clears the stored slug list", r.status === 200 && r.json.data.projects.slugs.length === 0, JSON.stringify(r.json.data.projects));

r = await call("PUT", { ...valid, projects: { mode: "selected", slugs: [] } });
check("'selected' with no projects -> 400", r.status === 400 && /at least one project/.test(r.json.message), r.json.message);
r = await call("PUT", { ...valid, projects: { mode: "selected", slugs: ["../etc/passwd"] } });
check("bad project slug -> 400", r.status === 400, r.json.message);
r = await call("PUT", { ...valid, contact: { ...valid.contact, email: "nope" } });
check("bad email -> 400", r.status === 400 && /email/.test(r.json.message), r.json.message);
r = await call("PUT", { ...valid, contact: { ...valid.contact, github: "my handle" } });
check("handle with spaces -> 400", r.status === 400, r.json.message);
for (const bad of ["javascript:alert(1)", "//evil.example/x.pdf", "ftp://x.dev/cv.pdf", "data:text/html,hi", "resume.pdf"]) {
  r = await call("PUT", { ...valid, pdfUrl: bad });
  check(`pdfUrl ${JSON.stringify(bad)} rejected`, r.status === 400, r.json?.message);
}
for (const good of ["", "/resume.pdf", "https://drive.example.com/file/d/abc/view"]) {
  r = await call("PUT", { ...valid, pdfUrl: good });
  check(`pdfUrl ${JSON.stringify(good)} accepted`, r.status === 200, r.json?.message);
}
r = await call("PUT", { ...valid, skillGroups: [{ label: "  ", items: [] }] });
check("empty skill group name -> 400", r.status === 400);
r = await call("PUT", { ...valid, achievements: [{ title: "", description: "x" }] });
check("empty achievement title -> 400", r.status === 400);
r = await call("PUT", { ...valid, summary: "x".repeat(1501) });
check("summary > 1500 -> 400", r.status === 400);
r = await call("PUT", { ...valid, skillGroups: Array.from({ length: 13 }, (_, i) => ({ label: `g${i}`, items: [] })) });
check("more than 12 skill groups -> 400", r.status === 400);
r = await call("PUT", {});
check("empty body is accepted and cleared to blanks (all fields optional)", r.status === 200 && r.json.data.summary === "" && r.json.data.skillGroups.length === 0 && r.json.data.projects.mode === "all", r.status);
r = await call("PUT", { ...valid, isDefault: true, _id: "x", evil: 1 });
check("unknown fields are stripped", r.status === 200 && r.json.data.isDefault === false && !("evil" in r.json.data));

console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);