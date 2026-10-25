process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const bcrypt = (await import("bcryptjs")).default;
const { default: Admin } = await import("../src/models/Admin.js");
const { EducationEntry } = await import("../src/models/EducationEntry.js");
const { ContactMessage } = await import("../src/models/ContactMessage.js");
const { AboutContent } = await import("../src/models/AboutContent.js");
const { createApp, API_ROUTES } = await import("../src/app.js");
const { parseOrigins } = await import("../src/config/env.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");
const { errorHandler } = await import("../src/middleware/errorHandler.js");
const { collectRoutes, findProblems, PUBLIC } = await import("../src/scripts/auditRoutes.js");
const { Router } = await import("express");
const { requireAdmin } = await import("../src/middleware/requireAdmin.js");

const CLIENT = "http://localhost:3000";
const EVIL = "https://evil.example";
const HDR = { "X-Requested-With": "riththika-admin" };

const passwordHash = await bcrypt.hash("correct-horse-battery", 4);
const ID = "507f1f77bcf86cd799439011";
Admin.findById = async (id) => ({ _id: id });
Admin.findOne = () => ({ select: async () => ({ _id: ID, email: "a@b.co", passwordHash, toJSON() { return { _id: ID, email: "a@b.co" }; } }) });
EducationEntry.findById = async () => null;
EducationEntry.findByIdAndDelete = async () => null;
EducationEntry.findOne = () => ({ sort: () => ({ select: async () => null }) });
EducationEntry.find = () => ({ sort: async () => [] });
AboutContent.findOne = async () => null;
let contactCreated = 0;
ContactMessage.create = async (d) => { contactCreated++; return { _id: ID, ...d }; };

const start = async (origins) => {
  const app = createApp({ allowedOrigins: origins, isProd: false });
  return new Promise((r) => { const s = app.listen(0, () => r(`http://127.0.0.1:${s.address().port}`)); });
};
const base = await start([CLIENT]);
const cookie = `admin_token=${signAdminToken(ID)}`;
const call = async (method, path, { headers = {}, body, raw, auth = true } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined && !raw ? { "Content-Type": "application/json" } : {}), ...(auth ? { cookie } : {}), ...headers },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  return { status: res.status, headers: res.headers, json: await res.json().catch(() => null) };
};
let fails = 0;
const check = (name, ok, extra = "") => { console.log(ok ? "PASS" : "FAIL", name, extra); if (!ok) fails++; };
const EDU = { institution: "X", degree: "Y", status: "Completed" };

/* ===== CORS ===== */
let r = await call("OPTIONS", "/api/education/" + ID, { auth: false, headers: { Origin: EVIL, "Access-Control-Request-Method": "DELETE", "Access-Control-Request-Headers": "x-requested-with" } });
check("preflight from another site gets no CORS permission", !r.headers.get("access-control-allow-origin"), r.headers.get("access-control-allow-origin"));
r = await call("OPTIONS", "/api/education/" + ID, { auth: false, headers: { Origin: CLIENT, "Access-Control-Request-Method": "DELETE", "Access-Control-Request-Headers": "x-requested-with" } });
check("preflight from CLIENT_URL is allowed with credentials + custom header",
  r.headers.get("access-control-allow-origin") === CLIENT && r.headers.get("access-control-allow-credentials") === "true" && /x-requested-with/i.test(r.headers.get("access-control-allow-headers") ?? ""));

/* ===== CSRF ===== */
r = await call("DELETE", "/api/education/" + ID);
check("logged-in DELETE without the security header -> 403", r.status === 403 && /security header/.test(r.json.message), r.status);
r = await call("PUT", "/api/education/" + ID, { body: EDU, headers: { Origin: EVIL } });
check("forged request from another site (no header) -> 403", r.status === 403, r.status);
r = await call("PUT", "/api/education/" + ID, { body: EDU, headers: { ...HDR, Origin: EVIL } });
check("header present but Origin is another site -> 403", r.status === 403 && /untrusted origin/.test(r.json.message), r.status);
r = await call("PUT", "/api/education/" + ID, { raw: JSON.stringify(EDU), headers: { "Content-Type": "text/plain", Origin: EVIL } });
check("classic cross-site <form> trick (text/plain, cookie sent) -> 403", r.status === 403, r.status);
r = await call("DELETE", "/api/education/" + ID, { headers: { ...HDR, Origin: "null" } });
check("Origin: null (sandboxed iframe / file://) -> 403", r.status === 403, r.status);
r = await call("DELETE", "/api/education/" + ID, { headers: { ...HDR, Origin: CLIENT } });
check("header + correct Origin passes the guard (404 = model says 'not found')", r.status === 404, r.status);
r = await call("DELETE", "/api/education/" + ID, { headers: HDR });
check("header, no Origin/Referer (curl, server-to-server) passes the guard", r.status === 404, r.status);
r = await call("DELETE", "/api/education/" + ID, { headers: { ...HDR, Referer: `${EVIL}/page` } });
check("Referer fallback: another site -> 403", r.status === 403, r.status);
r = await call("DELETE", "/api/education/" + ID, { headers: { ...HDR, Referer: `${CLIENT}/admin/education` } });
check("Referer fallback: our site passes", r.status === 404, r.status);
r = await call("DELETE", "/api/education/" + ID, { headers: { ...HDR, Referer: "garbage" } });
check("unparseable Referer -> 403", r.status === 403, r.status);
r = await call("GET", "/api/about", { auth: false, headers: { Origin: EVIL } });
check("GET needs no header (read-only)", r.status === 404 && r.json.message.includes("seeded"), r.status);

r = await call("POST", "/api/auth/login", { body: { email: "a@b.co", password: "correct-horse-battery" }, auth: false });
check("login without header -> 403 (blocks login-CSRF)", r.status === 403, r.status);
r = await call("POST", "/api/auth/login", { body: { email: "a@b.co", password: "correct-horse-battery" }, auth: false, headers: { ...HDR, Origin: CLIENT } });
const setCookie = r.headers.get("set-cookie") ?? "";
check("login with header -> 200 and HttpOnly cookie", r.status === 200 && /admin_token=/.test(setCookie) && /HttpOnly/i.test(setCookie), setCookie.slice(0, 60));
check("dev cookie is SameSite=Lax and not Secure", /SameSite=Lax/i.test(setCookie) && !/Secure/i.test(setCookie));
r = await call("POST", "/api/auth/logout", { auth: false });
check("logout without header -> 403", r.status === 403, r.status);

process.env.NODE_ENV = "production";
r = await call("POST", "/api/auth/login", { body: { email: "a@b.co", password: "correct-horse-battery" }, auth: false, headers: { ...HDR, Origin: CLIENT } });
const prodCookie = r.headers.get("set-cookie") ?? "";
check("production cookie is Secure + HttpOnly + SameSite=None", /Secure/i.test(prodCookie) && /HttpOnly/i.test(prodCookie) && /SameSite=None/i.test(prodCookie), prodCookie);
process.env.NODE_ENV = "test";

r = await call("POST", "/api/contact", { body: { name: "Visitor", email: "v@example.com", message: "hello" }, auth: false, headers: { Origin: EVIL } });
check("public contact form still works from any site, no header needed", r.status === 201 && contactCreated === 1, r.status);
r = await call("POST", "/api/contact/read-all", { auth: true, headers: { Origin: EVIL } });
check("POST /api/contact/read-all is NOT covered by the public exemption", r.status === 403, r.status);
r = await call("POST", "/api/contact/", { body: { name: "V", email: "v@example.com", message: "slash" }, auth: false });
check("public exemption also covers /api/contact/ (trailing slash)", r.status === 201, r.status);

/* multiple origins */
const base2 = base; // keep reference
const multi = await start([CLIENT, "https://riththika.dev"]);
const res2 = await fetch(multi + "/api/education/" + ID, { method: "DELETE", headers: { cookie, ...HDR, Origin: "https://riththika.dev" } });
check("second allowed origin is accepted", res2.status === 404, res2.status);
const res3 = await fetch(multi + "/api/education/" + ID, { method: "DELETE", headers: { cookie, ...HDR, Origin: "https://riththika.dev.evil.example" } });
check("look-alike origin is rejected", res3.status === 403, res3.status);

/* ===== every protected route really needs the login ===== */
const rows = collectRoutes(API_ROUTES);
let leaked = [];
for (const row of rows) {
  const id = `${row.method} ${row.path}`;
  if (PUBLIC.has(id)) continue;
  const url = row.path.replace(":id", ID).replace(":slug", "x");
  const res = await fetch(base + url, { method: row.method, headers: { ...HDR, Origin: CLIENT, "Content-Type": "application/json" }, body: row.method === "GET" || row.method === "DELETE" ? undefined : "{}" });
  if (res.status !== 401) leaked.push(`${id} -> ${res.status}`);
}
check(`all ${rows.length - [...PUBLIC].length} protected routes answer 401 without a login cookie`, leaked.length === 0, leaked.join("; "));

/* forged / tampered cookies */
for (const [label, c] of [
  ["garbage token", "admin_token=abc.def.ghi"],
  ["token signed with another secret", `admin_token=${(await import("jsonwebtoken")).default.sign({ sub: ID }, "x".repeat(48))}`],
  ["alg=none token", `admin_token=${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(`{"sub":"${ID}"}`).toString("base64url")}.`],
  ["expired token", `admin_token=${(await import("jsonwebtoken")).default.sign({ sub: ID }, "t".repeat(48), { expiresIn: -10 })}`],
]) {
  const res = await fetch(base + "/api/admin/stats", { headers: { cookie: c } });
  check(`${label} -> 401`, res.status === 401, res.status);
}

/* ===== error handler ===== */
r = await call("POST", "/api/auth/login", { raw: "{bad json", auth: false, headers: { ...HDR, "Content-Type": "application/json" } });
check("malformed JSON -> 400 'Invalid JSON body'", r.status === 400 && r.json.message === "Invalid JSON body", `${r.status} ${r.json?.message}`);
r = await call("POST", "/api/auth/login", { raw: JSON.stringify({ email: "a@b.co", password: "x".repeat(150_000) }), auth: false, headers: { ...HDR, "Content-Type": "application/json" } });
check("body over 100kb -> 413", r.status === 413, r.status);
r = await call("PUT", "/api/education/" + ID, { body: { institution: "", degree: "Y", status: "Completed" }, headers: HDR });
check("validation failure is a 400 with its message (was a hidden 500 before)", r.status === 400 && /Institution is required/.test(r.json.message), `${r.status} ${r.json?.message}`);
r = await call("POST", "/api/auth/login", { body: { email: "a@b.co", password: "wrong-password-here" }, auth: false, headers: HDR });
check("wrong password -> 401 'Invalid email or password' (AppError keeps its status)", r.status === 401 && r.json.message === "Invalid email or password", r.status);

const run = (err) => { const out = {}; errorHandler(err, {}, { status(s) { out.status = s; return this; }, json(b) { out.body = b; } }, () => {}); return out; };
const origErr = console.error; console.error = () => {};
let o = run(Object.assign(new Error("E11000 dup key {email: x}"), { code: 11000 }));
check("duplicate key -> 409 without leaking index details", o.status === 409 && !/E11000/.test(o.body.message), o.body.message);
o = run(Object.assign(new Error("Cast to ObjectId failed for value 'x' at path _id"), { name: "CastError" }));
check("CastError -> 400 'Invalid id'", o.status === 400 && o.body.message === "Invalid id");
o = run(new Error("connect ECONNREFUSED 10.0.0.5:27017"));
check("unexpected error -> 500 with a generic message (no internals leaked)", o.status === 500 && o.body.message === "Something went wrong");
o = run(Object.assign(new Error("weird"), { status: 99999 }));
check("nonsense status code is clamped to 500", o.status === 500);
console.error = origErr;

/* ===== headers ===== */
r = await call("GET", "/api/health", { auth: false });
check("Cache-Control: no-store on API responses", r.headers.get("cache-control") === "no-store");
check("helmet headers present, X-Powered-By removed", r.headers.get("x-content-type-options") === "nosniff" && !r.headers.get("x-powered-by"));

/* ===== parseOrigins ===== */
check("parseOrigins strips trailing slash and path", JSON.stringify(parseOrigins("http://localhost:3000/")) === '["http://localhost:3000"]' && parseOrigins("https://a.dev/some/path")[0] === "https://a.dev");
check("parseOrigins handles lists, spaces and duplicates", JSON.stringify(parseOrigins(" https://a.dev , https://b.dev,https://a.dev/ ")) === '["https://a.dev","https://b.dev"]');
for (const bad of ["", "localhost:3000", "ftp://x.dev", "not a url"]) {
  let threw = false; try { parseOrigins(bad); } catch { threw = true; }
  check(`parseOrigins rejects ${JSON.stringify(bad)}`, threw);
}

/* ===== the audit itself catches mistakes ===== */
const bad = Router();
bad.get("/secret", (_q, s) => s.json({}));                 // unprotected, not public
bad.post("/things", requireAdmin, (_q, s) => s.json({}));  // protected, but no validator
bad.use(requireAdmin);
bad.delete("/after-guard/:id", (_q, s) => s.json({}));     // protected by router.use
const problems = findProblems(collectRoutes([["/api/bad", bad]]));
check("audit flags an unprotected route", problems.some((p) => p.includes("GET /api/bad/secret") && /without login/.test(p)), problems.join(" | "));
check("audit flags a write route with no validate()", problems.some((p) => p.includes("POST /api/bad/things") && /no validate/.test(p)));
check("audit understands router.use(requireAdmin)", !problems.some((p) => p.includes("after-guard")));
check("audit passes on the real application", findProblems(rows).length === 0, findProblems(rows).join("; "));

console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);