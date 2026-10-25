import http from "node:http";
process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const { default: Admin } = await import("../src/models/Admin.js");
const { ProfileImage } = await import("../src/models/ProfileImage.js");
const { createApp } = await import("../src/app.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");

const ID = "507f1f77bcf86cd799439011";
Admin.findById = async (id) => ({ _id: id });

// in-memory stand-in for the one ProfileImage document
let store = null, clock = Date.parse("2026-10-14T10:00:00Z"), dataReads = 0;
const view = (d, withData) => d && { contentType: d.contentType, size: d.size, updatedAt: d.updatedAt, ...(withData ? { data: d.data } : {}) };
ProfileImage.findOne = () => ({ select: async (f) => { if (f.includes("+data")) dataReads++; return view(store, f.includes("+data")); } });
ProfileImage.findOneAndUpdate = (_q, upd, opts) => {
  if (!opts.upsert || opts.returnDocument !== "after") throw new Error("unexpected options");
  const { contentType, size, data } = upd.$set;
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) throw new Error("model would reject " + contentType);
  store = { contentType, size, data, updatedAt: new Date((clock += 1000)) };
  return { select: async () => view(store) };
};
ProfileImage.deleteMany = async () => { store = null; return {}; };

const CLIENT = "http://localhost:3000";
const app = createApp({ allowedOrigins: [CLIENT], isProd: false });
const base = await new Promise((r) => { const s = app.listen(0, () => r(`http://127.0.0.1:${s.address().port}`)); });
const cookie = `admin_token=${signAdminToken(ID)}`;
const HDR = { "X-Requested-With": "riththika-admin" };

// real file signatures, padded
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 1)]);
const PNG2 = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(300, 2)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 3)]);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.from([1, 0, 0, 0]), Buffer.from("WEBP"), Buffer.alloc(200, 4)]);

const upload = async (buf, { type = "image/png", name = "me.png", field = "image", auth = true, headers = HDR, extra } = {}) => {
  const fd = new FormData();
  if (extra) fd.append("note", extra);
  fd.append(field, new Blob([buf], { type }), name);
  const res = await fetch(base + "/api/profile-image", { method: "PUT", body: fd, headers: { ...(auth ? { Cookie: cookie } : {}), ...headers } });
  return { status: res.status, json: await res.json().catch(() => null) };
};

let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log("  ok  ", name); } catch (e) { fail++; console.log("  FAIL", name, "->", e.message); } };
const eq = (a, b, m = "") => { if (a !== b) throw new Error(`${m} expected ${b}, got ${a}`); };

await t("GET with no photo uploaded -> 404 JSON", async () => {
  const r = await fetch(base + "/api/profile-image"); eq(r.status, 404); eq((await r.json()).success, false);
});
await t("PUT without login -> 401 (nothing stored)", async () => { eq((await upload(PNG, { auth: false })).status, 401); eq(store, null); });
await t("PUT without the CSRF header -> 403", async () => { eq((await upload(PNG, { headers: {} })).status, 403); eq(store, null); });
await t("PUT from an untrusted Origin -> 403", async () => { eq((await upload(PNG, { headers: { ...HDR, Origin: "https://evil.example" } })).status, 403); });
await t("meta needs login", async () => { eq((await fetch(base + "/api/profile-image/meta")).status, 401); });
await t("meta when empty", async () => {
  const r = await fetch(base + "/api/profile-image/meta", { headers: { Cookie: cookie } });
  eq(r.status, 200); eq((await r.json()).data.exists, false);
});

await t("valid PNG uploads and reports details", async () => {
  const r = await upload(PNG); eq(r.status, 200);
  eq(r.json.data.exists, true); eq(r.json.data.contentType, "image/png"); eq(r.json.data.size, PNG.length);
  if ("data" in r.json.data && Buffer.isBuffer(r.json.data.data)) throw new Error("bytes leaked in response");
});
let etag;
await t("public GET returns the exact bytes with safe headers", async () => {
  const r = await fetch(base + "/api/profile-image", { headers: { Origin: CLIENT } });
  eq(r.status, 200); eq(r.headers.get("content-type").split(";")[0], "image/png");
  eq(Buffer.compare(Buffer.from(await r.arrayBuffer()), PNG), 0, "bytes differ");
  eq(r.headers.get("cross-origin-resource-policy"), "cross-origin", "CORP");
  eq(r.headers.get("x-content-type-options"), "nosniff");
  if (!/must-revalidate/.test(r.headers.get("cache-control"))) throw new Error("cache-control " + r.headers.get("cache-control"));
  etag = r.headers.get("etag"); if (!etag) throw new Error("no etag");
});
await t("revalidation with If-None-Match -> 304 and the bytes are not loaded", async () => {
  const before = dataReads;
  // raw request: fetch() silently adds Cache-Control: no-cache to conditional requests, browsers' revalidation does not
  const status = await new Promise((resolve, reject) => {
    const u = new URL(base + "/api/profile-image");
    http.get({ host: u.hostname, port: u.port, path: u.pathname, headers: { "If-None-Match": etag } }, (res) => { res.resume(); res.on("end", () => resolve(res.statusCode)); }).on("error", reject);
  });
  eq(status, 304); eq(dataReads, before, "data was read");
});
await t("JPEG and WebP are accepted (type decided by signature)", async () => {
  eq((await upload(JPG, { type: "image/jpeg", name: "a.jpg" })).json.data.contentType, "image/jpeg");
  eq((await upload(WEBP, { type: "image/webp", name: "a.webp" })).json.data.contentType, "image/webp");
});
await t("replacing the photo changes the ETag and the bytes", async () => {
  await upload(PNG); const e1 = (await fetch(base + "/api/profile-image")).headers.get("etag");
  await upload(PNG2);
  const r = await fetch(base + "/api/profile-image", { headers: { "If-None-Match": e1 } });
  eq(r.status, 200, "old etag must not give 304"); if (r.headers.get("etag") === e1) throw new Error("etag unchanged");
  eq(Buffer.compare(Buffer.from(await r.arrayBuffer()), PNG2), 0);
});

const keep = store;
await t("text file renamed .png with image/png type -> 400 (signature check)", async () => {
  const r = await upload(Buffer.from("<?php echo 'hi'; ?> definitely not an image"), { type: "image/png", name: "evil.png" });
  eq(r.status, 400); if (!/valid JPG, PNG or WebP/.test(r.json.message)) throw new Error(r.json.message);
});
await t("SVG -> 400 (scripts in SVG are not allowed)", async () => {
  eq((await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), { type: "image/svg+xml", name: "x.svg" })).status, 400);
});
await t("GIF -> 400", async () => { eq((await upload(Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(50)]), { type: "image/gif", name: "a.gif" })).status, 400); });
await t("PNG type header but JPEG-less random bytes -> 400", async () => { eq((await upload(Buffer.alloc(500, 7))).status, 400); });
await t("file over 2 MB -> 413 with a clear message", async () => {
  const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024 + 10)]);
  const r = await upload(big); eq(r.status, 413); if (!/2 MB/.test(r.json.message)) throw new Error(r.json.message);
});
await t("exactly at the limit is accepted", async () => {
  const ok = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024 - PNG.length)]); eq(ok.length, 2 * 1024 * 1024);
  eq((await upload(ok)).status, 200); await upload(PNG2);
});
await t("wrong form field name -> 400", async () => { eq((await upload(PNG, { field: "file" })).status, 400); });
await t("extra text fields are refused -> 400", async () => { eq((await upload(PNG, { extra: "hello" })).status, 400); });
await t("no file at all -> 400", async () => {
  const res = await fetch(base + "/api/profile-image", { method: "PUT", headers: { Cookie: cookie, ...HDR, "Content-Type": "application/json" }, body: "{}" });
  eq(res.status, 400);
});
await t("none of the rejected uploads changed the stored photo", async () => { eq(store.data.length, PNG2.length); });

await t("DELETE needs login + header, then GET is 404 again", async () => {
  eq((await fetch(base + "/api/profile-image", { method: "DELETE", headers: HDR })).status, 401);
  eq((await fetch(base + "/api/profile-image", { method: "DELETE", headers: { Cookie: cookie } })).status, 403);
  const r = await fetch(base + "/api/profile-image", { method: "DELETE", headers: { Cookie: cookie, ...HDR } });
  eq(r.status, 200); eq((await r.json()).data.exists, false);
  eq((await fetch(base + "/api/profile-image")).status, 404);
});
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);