process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const mongoose = (await import("mongoose")).default;
const { default: Admin } = await import("../src/models/Admin.js");
const { Certification } = await import("../src/models/Certification.js");
const { Project } = await import("../src/models/Project.js");
const { ProjectImage } = await import("../src/models/ProjectImage.js");
const { sweepOrphans } = await import("../src/utils/projectImages.js");
const { HomeContent } = await import("../src/models/HomeContent.js");
HomeContent.exists = async () => null; HomeContent.distinct = async () => [];
const { createApp } = await import("../src/app.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");

const oid = () => String(new mongoose.Types.ObjectId());
Admin.findById = async (id) => ({ _id: id });
let docs = [];
const mk = (d) => ({ _id: oid(), createdAt: new Date(), ...d, set(b) { Object.assign(this, b); }, async save() {} });
Certification.find = () => ({ sort: async () => [...docs].sort((a, b) => a.order - b.order) });
Certification.findOne = () => ({ sort: () => ({ select: async () => [...docs].sort((a, b) => b.order - a.order)[0] ?? null }) });
Certification.create = async (d) => { const x = mk(d); docs.push(x); return x; };
Certification.findById = async (id) => docs.find((d) => d._id === String(id)) ?? null;
Certification.findByIdAndDelete = async (id) => { const x = docs.find((d) => d._id === String(id)); docs = docs.filter((d) => d !== x); return x ?? null; };
let images = new Map(), projectDocs = [];
ProjectImage.create = async (d) => { const x = { _id: oid(), createdAt: new Date(), ...d }; images.set(x._id, x); return x; };
ProjectImage.find = (q) => ({ select: async () => [...images.values()].filter((i) => i.createdAt < q.createdAt.$lt) });
ProjectImage.deleteOne = async ({ _id }) => { images.delete(String(_id)); return {}; };
ProjectImage.deleteMany = async ({ _id }) => { for (const id of _id.$in) images.delete(String(id)); return {}; };
Project.exists = async ({ $or }) => (projectDocs.some((p) => [p.image, ...(p.caseStudy?.screenshots ?? [])].includes($or[0].image)) ? { _id: 1 } : null);
Project.distinct = async (f) => (f === "image" ? projectDocs.map((p) => p.image).filter(Boolean) : projectDocs.flatMap((p) => p.caseStudy?.screenshots ?? []));
Certification.exists = async ({ image }) => (docs.some((d) => d.image === image) ? { _id: 1 } : null);
Certification.distinct = async () => docs.map((d) => d.image).filter(Boolean);
let bulk = null; Certification.bulkWrite = async (ops) => { bulk = ops; for (const o of ops) docs.find((d) => d._id === o.updateOne.filter._id).order = o.updateOne.update.$set.order; };

const app = createApp({ allowedOrigins: ["http://localhost:3000"], isProd: false });
const base = await new Promise((r) => { const s = app.listen(0, () => r(`http://127.0.0.1:${s.address().port}`)); });
const cookie = `admin_token=${signAdminToken("507f1f77bcf86cd799439011")}`;
const H = { "X-Requested-With": "riththika-admin", "Content-Type": "application/json" };
const call = (method, path, body, { auth = true, headers = H } = {}) =>
  fetch(base + path, { method, headers: { ...headers, ...(auth ? { Cookie: cookie } : {}) }, body: body && JSON.stringify(body) }).then(async (r) => ({ status: r.status, json: await r.json().catch(() => null) }));
const good = { title: "Certified Cloud Practitioner", issuer: "Some Org", issueDate: "2026-03", expiryDate: "", credentialId: "", credentialUrl: "", description: "", skills: [] };

let pass = 0, fail = 0;
const t = async (n, f) => { try { await f(); pass++; console.log("  ok  ", n); } catch (e) { fail++; console.log("  FAIL", n, "->", e.message); } };
const eq = (a, b, m = "") => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

await t("public GET works without login (empty list)", async () => { const r = await call("GET", "/api/certifications", null, { auth: false }); eq(r.status, 200); eq(r.json.data.certifications, []); });
await t("write routes need login", async () => {
  eq((await call("POST", "/api/certifications", good, { auth: false })).status, 401);
  eq((await call("PUT", "/api/certifications/reorder", { ids: [oid()] }, { auth: false })).status, 401);
  eq((await call("DELETE", `/api/certifications/${oid()}`, null, { auth: false })).status, 401);
});
await t("write routes need the CSRF header", async () => eq((await call("POST", "/api/certifications", good, { headers: { "Content-Type": "application/json" } })).status, 403));
await t("create: 201, order starts at 1 and increments", async () => {
  const a = await call("POST", "/api/certifications", good); eq(a.status, 201); eq(a.json.data.certification.order, 1);
  const b = await call("POST", "/api/certifications", { ...good, title: "Second" }); eq(b.json.data.certification.order, 2);
});
await t("validation: missing fields, bad month, bad URL, expiry before issue", async () => {
  eq((await call("POST", "/api/certifications", { ...good, title: "" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, issuer: " " })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, issueDate: "" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, issueDate: "2026-13" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, issueDate: "March 2026" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, credentialUrl: "javascript:alert(1)" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, credentialUrl: "//evil.example" })).status, 400);
  const r = await call("POST", "/api/certifications", { ...good, expiryDate: "2025-01" }); eq(r.status, 400); eq(/Expiry can't be before/.test(r.json.message), true, r.json.message);
  eq(docs.length, 2, "invalid data was stored");
});
await t("valid optional fields accepted; skills deduped; text trimmed", async () => {
  const r = await call("POST", "/api/certifications", { ...good, title: "  Padded  ", expiryDate: "2029-03", credentialId: "ABC-123", credentialUrl: "https://example.com/v/1", skills: ["AWS", "aws", "S3"] });
  eq(r.status, 201); eq(r.json.data.certification.title, "Padded"); eq(r.json.data.certification.skills, ["AWS", "S3"]);
});
await t("public GET lists in order", async () => { const r = await call("GET", "/api/certifications", null, { auth: false }); eq(r.json.data.certifications.map((c) => c.order), [1, 2, 3]); });
await t("update: 200; unknown id 404; malformed id 400", async () => {
  const id = docs[0]._id;
  const r = await call("PUT", `/api/certifications/${id}`, { ...good, title: "Renamed" }); eq(r.status, 200); eq(r.json.data.certification.title, "Renamed");
  eq((await call("PUT", `/api/certifications/${oid()}`, good)).status, 404);
  eq((await call("PUT", "/api/certifications/nope", good)).status, 400);
});
await t("reorder writes the new positions; rejects bad ids", async () => {
  const ids = docs.map((d) => d._id).reverse();
  eq((await call("PUT", "/api/certifications/reorder", { ids })).status, 200);
  eq(bulk.map((o) => o.updateOne.update.$set.order), [1, 2, 3]);
  eq((await call("GET", "/api/certifications", null, { auth: false })).json.data.certifications.map((c) => c._id), ids);
  eq((await call("PUT", "/api/certifications/reorder", { ids: ["x"] })).status, 400);
  eq((await call("PUT", "/api/certifications/reorder", { ids: [] })).status, 400);
});
await t("delete: 200 then 404; malformed id 400", async () => {
  const id = docs[0]._id;
  eq((await call("DELETE", `/api/certifications/${id}`)).status, 200); eq(docs.length, 2);
  eq((await call("DELETE", `/api/certifications/${id}`)).status, 404);
  eq((await call("DELETE", "/api/certifications/zzz")).status, 400);
});

// ---------- certificate images ----------
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 1)]);
const upload = async () => {
  const fd = new FormData(); fd.append("image", new Blob([PNG], { type: "image/png" }), "c.png");
  const r = await fetch(base + "/api/project-images", { method: "POST", body: fd, headers: { Cookie: cookie, "X-Requested-With": "riththika-admin" } });
  return (await r.json()).data;
};
docs = []; images.clear();
await t("image field: stored on create; '' by default", async () => {
  const a = await upload();
  const r = await call("POST", "/api/certifications", { ...good, image: a.url }); eq(r.status, 201); eq(r.json.data.certification.image, a.url);
  const r2 = await call("POST", "/api/certifications", { ...good, title: "No image" }); eq(r2.json.data.certification.image, "");
});
await t("image field: rejects '//host', javascript: and non-strings; accepts /public path and https URL", async () => {
  eq((await call("POST", "/api/certifications", { ...good, image: "//evil.example/x.png" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, image: "javascript:alert(1)" })).status, 400);
  eq((await call("POST", "/api/certifications", { ...good, image: "/certs/a.png" })).status, 201);
  eq((await call("POST", "/api/certifications", { ...good, image: "https://example.com/a.png" })).status, 201);
});
await t("replacing the image deletes the old uploaded file; the new one stays", async () => {
  const [c] = docs; const oldId = c.image.split("/").pop(); const b = await upload();
  eq(images.has(oldId), true);
  eq((await call("PUT", `/api/certifications/${c._id}`, { ...good, image: b.url })).status, 200);
  eq(images.has(oldId), false, "old kept"); eq(images.has(b.id), true, "new lost");
});
await t("saving without changing the image keeps it", async () => {
  const [c] = docs; const id = c.image.split("/").pop();
  eq((await call("PUT", `/api/certifications/${c._id}`, { ...good, title: "Renamed", image: c.image })).status, 200); eq(images.has(id), true);
});
await t("clearing the image deletes the uploaded file", async () => {
  const [c] = docs; const id = c.image.split("/").pop();
  eq((await call("PUT", `/api/certifications/${c._id}`, { ...good, image: "" })).status, 200); eq(images.has(id), false);
});
await t("replacing a /public or external image never touches uploads", async () => {
  const a = await upload(); const n = images.size;
  const ext = docs.find((d) => d.image === "/certs/a.png");
  eq((await call("PUT", `/api/certifications/${ext._id}`, { ...good, image: a.url })).status, 200); eq(images.size, n);
});
await t("deleting a certification deletes its uploaded image", async () => {
  const c = docs.find((d) => d.image.startsWith("/api/project-images/")); const id = c.image.split("/").pop();
  eq((await call("DELETE", `/api/certifications/${c._id}`)).status, 200); eq(images.has(id), false);
});
await t("an image shared with a project survives when the certification drops it", async () => {
  const a = await upload(); projectDocs = [{ image: a.url, caseStudy: { screenshots: [] } }];
  const r = await call("POST", "/api/certifications", { ...good, image: a.url });
  eq((await call("PUT", `/api/certifications/${r.json.data.certification._id}`, { ...good, image: "" })).status, 200);
  eq(images.has(a.id), true); projectDocs = [];
});
await t("DELETE /api/project-images/:id is refused (409) while a certification uses the image", async () => {
  const a = await upload(); await call("POST", "/api/certifications", { ...good, image: a.url });
  eq((await call("DELETE", `/api/project-images/${a.id}`)).status, 409); eq(images.has(a.id), true);
});
await t("the hourly orphan sweep keeps certificate images but removes unused old ones", async () => {
  const used = await upload(); const orphan = await upload();
  images.get(used.id).createdAt = new Date(Date.now() - 5 * 3600000); images.get(orphan.id).createdAt = new Date(Date.now() - 5 * 3600000);
  await call("POST", "/api/certifications", { ...good, image: used.url });
  await sweepOrphans();
  eq(images.has(used.id), true, "certificate image swept!"); eq(images.has(orphan.id), false);
});
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);