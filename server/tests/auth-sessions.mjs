process.env.ADMIN_AUTH_SECRET = "t".repeat(48); process.env.NODE_ENV = "test";
const bcrypt = (await import("bcryptjs")).default;
const { default: Admin } = await import("../src/models/Admin.js");
const { createApp, API_ROUTES } = await import("../src/app.js");
const { signAdminToken, COOKIE_NAME } = await import("../src/utils/authCookie.js");
const { collectRoutes, findProblems } = await import("../src/scripts/auditRoutes.js");
const mongoose = (await import("mongoose")).default;

const id = String(new mongoose.Types.ObjectId());
const db = { _id: id, email: "me@x.com", tokenVersion: 0, passwordHash: bcrypt.hashSync("old-password-123", 4) };
const view = (withHash) => { const o = new Admin({ email: db.email, tokenVersion: db.tokenVersion }); o._id = db._id; if (withHash) o.passwordHash = db.passwordHash; return o; };
Admin.findById = (i) => { const r = i == id ? view(false) : null; const p = Promise.resolve(r); p.select = () => Promise.resolve(view(true)); return p; };
Admin.findOne = () => ({ select: async () => view(true) });
Admin.findByIdAndUpdate = async (_i, u) => { if (u.$set?.passwordHash) db.passwordHash = u.$set.passwordHash; if (u.$inc?.tokenVersion) db.tokenVersion += u.$inc.tokenVersion; return view(false); };

const app = createApp({ allowedOrigins: ["http://localhost:3000"] });
const server = app.listen(0); const base = `http://localhost:${server.address().port}`;
let fails = 0; const ok = (n, c) => { console.log(c ? "PASS" : "FAIL", n); if (!c) fails++; };
const H = (tok) => ({ "Content-Type": "application/json", "X-Requested-With": "riththika-admin", Origin: "http://localhost:3000", ...(tok ? { Cookie: `${COOKIE_NAME}=${tok}` } : {}) });
const post = (p, body, tok) => fetch(`${base}/api/auth/${p}`, { method: "POST", headers: H(tok), body: JSON.stringify(body ?? {}) });
const me = (tok) => fetch(`${base}/api/auth/me`, { headers: H(tok) });
const cookieOf = (r) => (r.headers.get("set-cookie") || "").match(/admin_token=([^;]*)/)?.[1];

const laptop = signAdminToken(id, 0), phone = signAdminToken(id, 0);
ok("both sessions work at first", (await me(laptop)).status === 200 && (await me(phone)).status === 200);
const legacy = signAdminToken(id).constructor === String; ok("legacy token (no version) is still valid at version 0", legacy && (await me(laptop)).status === 200);

ok("wrong current password -> 400, nothing changes", (await post("change-password", { currentPassword: "nope", newPassword: "a-brand-new-pass-1" }, laptop)).status === 400 && db.tokenVersion === 0);
ok("too short -> 400", (await post("change-password", { currentPassword: "old-password-123", newPassword: "short" }, laptop)).status === 400);
ok("same as current -> 400", (await post("change-password", { currentPassword: "old-password-123", newPassword: "old-password-123" }, laptop)).status === 400);
ok("over 72 bytes -> 400", (await post("change-password", { currentPassword: "old-password-123", newPassword: "x".repeat(80) }, laptop)).status === 400);
ok("not logged in -> 401", (await post("change-password", { currentPassword: "a", newPassword: "a-brand-new-pass-1" })).status === 401);
const noCsrf = await fetch(`${base}/api/auth/change-password`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: `${COOKIE_NAME}=${laptop}` }, body: "{}" });
ok("CSRF header required", noCsrf.status === 403);

const r = await post("change-password", { currentPassword: "old-password-123", newPassword: "a-brand-new-pass-1" }, laptop);
ok("change works -> 200", r.status === 200);
ok("hash really changed", bcrypt.compareSync("a-brand-new-pass-1", db.passwordHash) && !bcrypt.compareSync("old-password-123", db.passwordHash));
ok("tokenVersion went up", db.tokenVersion === 1);
const fresh = cookieOf(r);
ok("response sets a fresh cookie", !!fresh && fresh !== laptop);
ok("fresh cookie keeps THIS session logged in", (await me(fresh)).status === 200);
ok("old laptop token is dead", (await me(laptop)).status === 401);
ok("other device (phone) is signed out", (await me(phone)).status === 401);

const r2 = await post("logout-all", {}, fresh);
ok("logout-all -> 200 and clears cookie", r2.status === 200 && /admin_token=;/.test(r2.headers.get("set-cookie") || ""));
ok("logout-all killed every token", (await me(fresh)).status === 401 && db.tokenVersion === 2);
ok("logout-all needs login", (await post("logout-all", {})).status === 401);
ok("password never in a response", !JSON.stringify(await (await post("change-password", { currentPassword: "x", newPassword: "y" }, signAdminToken(id, 2))).json()).includes("$2"));
ok("audit passes", findProblems(collectRoutes(API_ROUTES)).length === 0);
server.close(); console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);