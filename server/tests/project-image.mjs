import http from "node:http";
process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const mongoose = (await import("mongoose")).default;
const { default: Admin } = await import("../src/models/Admin.js");
const { Project } = await import("../src/models/Project.js");
const { ProjectImage } = await import("../src/models/ProjectImage.js");
const { Certification } = await import("../src/models/Certification.js");
const { HomeContent } = await import("../src/models/HomeContent.js");
HomeContent.exists = async () => null; HomeContent.distinct = async () => [];
const { createApp } = await import("../src/app.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");
const { sweepOrphans } = await import("../src/utils/projectImages.js");

const oid = () => String(new mongoose.Types.ObjectId());
Admin.findById = async (id) => ({ _id: id });

// ---- in-memory stand-ins ----
let images = new Map(), projects = new Map();
ProjectImage.create = async (d) => { const doc = { _id: oid(), createdAt: new Date(), ...d }; images.set(doc._id, doc); return doc; };
ProjectImage.findById = (id) => ({ select: async () => images.get(String(id)) ?? null });
ProjectImage.find = (q) => ({ select: async () => [...images.values()].filter((i) => i.createdAt < q.createdAt.$lt) });
ProjectImage.deleteOne = async ({ _id }) => { images.delete(String(_id)); return {}; };
ProjectImage.deleteMany = async ({ _id }) => { for (const id of _id.$in) images.delete(String(id)); return {}; };
const mkProject = (d) => { const p = { _id: oid(), image: null, ...d, set(b) { Object.assign(this, b); }, async save() {} }; projects.set(p._id, p); return p; };
const urlsOf = (p) => [p.image, ...(p.caseStudy?.screenshots ?? [])].filter(Boolean);
Project.exists = async ({ $or }) => { const url = $or[0].image; if ($or[1]["caseStudy.screenshots"] !== url) throw new Error("bad query"); return [...projects.values()].some((p) => urlsOf(p).includes(url)) ? { _id: 1 } : null; };
Certification.exists = async () => null; Certification.distinct = async () => [];
Project.distinct = async (field) => field === "image" ? [...projects.values()].map((p) => p.image).filter(Boolean) : [...projects.values()].flatMap((p) => p.caseStudy?.screenshots ?? []);
Project.findById = async (id) => projects.get(String(id)) ?? null;
Project.findByIdAndDelete = async (id) => { const p = projects.get(String(id)); projects.delete(String(id)); return p ?? null; };

const CLIENT = "http://localhost:3000";
const app = createApp({ allowedOrigins: [CLIENT], isProd: false });
const base = await new Promise((r) => { const s = app.listen(0, () => r(`http://127.0.0.1:${s.address().port}`)); });
const cookie = `admin_token=${signAdminToken("507f1f77bcf86cd799439011")}`;
const HDR = { "X-Requested-With": "riththika-admin" };
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 1)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 3)]);

const upload = async (buf = PNG, { type = "image/png", name = "c.png", field = "image", auth = true, headers = HDR } = {}) => {
  const fd = new FormData(); fd.append(field, new Blob([buf], { type }), name);
  const r = await fetch(base + "/api/project-images", { method: "POST", body: fd, headers: { ...(auth ? { Cookie: cookie } : {}), ...headers } });
  return { status: r.status, json: await r.json().catch(() => null) };
};
const api = (method, path, body) => fetch(base + path, { method, headers: { Cookie: cookie, ...HDR, "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
const projectBody = (image, screenshots) => ({ title: "Chat", slug: "chat", category: "Full Stack", description: "d", image, featured: false, ...(screenshots ? { caseStudy: { screenshots } } : {}) });

let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log("  ok  ", name); } catch (e) { fail++; console.log("  FAIL", name, "->", e.message); } };
const eq = (a, b, m = "") => { if (a !== b) throw new Error(`${m} expected ${b}, got ${a}`); };

let url, id;
await t("upload needs login", async () => eq((await upload(PNG, { auth: false })).status, 401));
await t("upload needs the CSRF header", async () => eq((await upload(PNG, { headers: {} })).status, 403));
await t("valid PNG -> 201 with id and /api/project-images/<id> url", async () => {
  const r = await upload(); eq(r.status, 201);
  ({ url, id } = r.json.data);
  eq(url, `/api/project-images/${id}`); eq(r.json.data.contentType, "image/png"); eq(images.size, 1);
  if ("data" in r.json.data) throw new Error("bytes leaked");
});
await t("public GET returns exact bytes, long cache, cross-origin allowed", async () => {
  const r = await fetch(base + url, { headers: { Origin: CLIENT } });
  eq(r.status, 200); eq(r.headers.get("content-type").split(";")[0], "image/png");
  eq(Buffer.compare(Buffer.from(await r.arrayBuffer()), PNG), 0);
  eq(r.headers.get("cross-origin-resource-policy"), "cross-origin");
  if (!/immutable/.test(r.headers.get("cache-control"))) throw new Error(r.headers.get("cache-control"));
  eq(r.headers.get("x-content-type-options"), "nosniff");
});
await t("unknown / malformed id -> 404 JSON", async () => {
  eq((await fetch(base + `/api/project-images/${oid()}`)).status, 404);
  eq((await fetch(base + "/api/project-images/not-an-id")).status, 404);
});
await t("JPEG accepted", async () => eq((await upload(JPG, { type: "image/jpeg", name: "a.jpg" })).json.data.contentType, "image/jpeg"));
await t("fake image (text with image/png type) -> 400, nothing stored", async () => {
  const n = images.size; eq((await upload(Buffer.from("<?php evil ?> not an image at all"))).status, 400); eq(images.size, n);
});
await t("SVG and GIF -> 400", async () => {
  eq((await upload(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>1</script></svg>"), { type: "image/svg+xml", name: "a.svg" })).status, 400);
  eq((await upload(Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(40)]), { type: "image/gif", name: "a.gif" })).status, 400);
});
await t("over 2 MB -> 413", async () => eq((await upload(Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]))).status, 413));
await t("wrong field name -> 400", async () => eq((await upload(PNG, { field: "cover" })).status, 400));

images.clear();
await t("DELETE of an unsaved upload works; needs login", async () => {
  const a = (await upload()).json.data;
  eq((await fetch(base + `/api/project-images/${a.id}`, { method: "DELETE", headers: HDR })).status, 401);
  eq((await api("DELETE", `/api/project-images/${a.id}`)).status, 200); eq(images.size, 0);
  eq((await api("DELETE", "/api/project-images/zzz")).status, 400);
});
await t("DELETE of an image a project uses -> 409 and it survives", async () => {
  const a = (await upload()).json.data; mkProject({ image: a.url });
  const r = await api("DELETE", `/api/project-images/${a.id}`); eq(r.status, 409); eq(images.has(a.id), true);
});

projects.clear(); images.clear();
await t("saving a project with a NEW cover deletes the old uploaded cover", async () => {
  const a = (await upload()).json.data, b = (await upload()).json.data;
  const p = mkProject({ image: a.url });
  const r = await api("PUT", `/api/projects/${p._id}`, projectBody(b.url)); eq(r.status, 200);
  eq(images.has(a.id), false, "old kept"); eq(images.has(b.id), true, "new lost");
});
await t("clearing the cover deletes the uploaded file", async () => {
  const [p] = [...projects.values()]; const before = images.size;
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody(""))).status, 200);
  eq(images.size, before - 1); eq(p.image, null);
});
await t("replacing an external/public-path cover never touches uploads", async () => {
  const a = (await upload()).json.data; const p = mkProject({ image: "/projects/old.png" }); const n = images.size;
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody(a.url))).status, 200); eq(images.size, n);
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("https://example.com/x.png"))).status, 200); eq(images.has(a.id), false);
});
await t("saving without changing the cover keeps it", async () => {
  const a = (await upload()).json.data; const p = mkProject({ image: a.url });
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody(a.url))).status, 200); eq(images.has(a.id), true);
});
await t("deleting a project deletes its uploaded cover", async () => {
  const a = (await upload()).json.data; const p = mkProject({ image: a.url });
  eq((await api("DELETE", `/api/projects/${p._id}`)).status, 200); eq(images.has(a.id), false);
});
await t("two projects sharing one cover: deleting one keeps the file", async () => {
  const a = (await upload()).json.data; const p1 = mkProject({ image: a.url }); mkProject({ image: a.url });
  eq((await api("DELETE", `/api/projects/${p1._id}`)).status, 200); eq(images.has(a.id), true);
});
await t("validator: protocol-relative '//host/x.png' is rejected, '/api/project-images/..' accepted", async () => {
  const p = mkProject({});
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("//evil.example/x.png"))).status, 400);
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("javascript:alert(1)"))).status, 400);
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("/projects/ok.png"))).status, 200);
});

projects.clear(); images.clear();
await t("screenshots: removing one from the list deletes only that file", async () => {
  const [a, b, c] = [(await upload()).json.data, (await upload()).json.data, (await upload()).json.data];
  const p = mkProject({ image: null, caseStudy: { screenshots: [a.url, b.url, c.url] } });
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", [a.url, c.url]))).status, 200);
  eq(images.has(a.id) && images.has(c.id), true, "kept ones lost"); eq(images.has(b.id), false, "removed one kept");
});
await t("screenshots: reordering and adding keep every file", async () => {
  const [p] = [...projects.values()]; const [x, y] = p.caseStudy.screenshots; const n = images.size;
  const d = (await upload()).json.data;
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", [y, d.url, x]))).status, 200); eq(images.size, n + 1);
});
await t("screenshots: an uploaded screenshot is not deletable via DELETE while a project uses it", async () => {
  const [p] = [...projects.values()]; const id = p.caseStudy.screenshots[0].split("/").pop();
  eq((await api("DELETE", `/api/project-images/${id}`)).status, 409);
});
await t("screenshots: moving an image from cover to screenshots keeps it", async () => {
  const a = (await upload()).json.data; const p = mkProject({ image: a.url, caseStudy: { screenshots: [] } });
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", [a.url]))).status, 200); eq(images.has(a.id), true);
});
await t("screenshots: deleting the project deletes cover and screenshots", async () => {
  const a = (await upload()).json.data, b = (await upload()).json.data;
  const p = mkProject({ image: a.url, caseStudy: { screenshots: [b.url] } });
  eq((await api("DELETE", `/api/projects/${p._id}`)).status, 200); eq(images.has(a.id) || images.has(b.id), false);
});
await t("screenshots: validator rejects '//host', javascript: and 21 entries", async () => {
  const p = mkProject({});
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", ["//evil.example/x.png"]))).status, 400);
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", ["javascript:alert(1)"]))).status, 400);
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", Array.from({ length: 21 }, (_, i) => `/s/${i}.png`)))).status, 400);
  eq((await api("PUT", `/api/projects/${p._id}`, projectBody("", ["/s/1.png", "https://x.com/2.png"]))).status, 200);
});

projects.clear(); images.clear();
await t("orphan sweep removes old unused uploads, keeps used and recent ones", async () => {
  const mk = async (ageMin) => { const d = await ProjectImage.create({ contentType: "image/png", size: 1, data: PNG }); d.createdAt = new Date(Date.now() - ageMin * 60000); return d; };
  const oldOrphan = await mk(180), oldUsed = await mk(180), recent = await mk(5);
  const oldShot = await mk(180);
  mkProject({ image: `/api/project-images/${oldUsed._id}`, caseStudy: { screenshots: [`/api/project-images/${oldShot._id}`] } });
  const removed = await sweepOrphans();
  eq(removed, 1); eq(images.has(oldOrphan._id), false); eq(images.has(oldUsed._id), true); eq(images.has(oldShot._id), true, "screenshot treated as orphan"); eq(images.has(recent._id), true);
});
await t("an upload triggers the sweep in the background", async () => {
  const stale = await ProjectImage.create({ contentType: "image/png", size: 1, data: PNG }); stale.createdAt = new Date(Date.now() - 5 * 3600000);
  eq((await upload()).status, 201); await new Promise((r) => setTimeout(r, 50)); eq(images.has(stale._id), false);
});
await t("a failing cleanup never breaks a project save", async () => {
  const a = (await upload()).json.data; const p = mkProject({ image: a.url });
  const orig = ProjectImage.deleteOne; ProjectImage.deleteOne = async () => { throw new Error("db down"); };
  const log = console.error; console.error = () => {};
  const r = await api("PUT", `/api/projects/${p._id}`, projectBody("")); console.error = log; ProjectImage.deleteOne = orig;
  eq(r.status, 200);
});
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);