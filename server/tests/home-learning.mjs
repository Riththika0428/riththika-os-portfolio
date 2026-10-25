process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const mongoose = (await import("mongoose")).default;
const { default: Admin } = await import("../src/models/Admin.js");
const { HomeContent } = await import("../src/models/HomeContent.js");
const { LearningContent } = await import("../src/models/LearningContent.js");
const { createApp, API_ROUTES } = await import("../src/app.js");
const { signAdminToken, COOKIE_NAME } = await import("../src/utils/authCookie.js");
const { collectRoutes, findProblems } = await import("../src/scripts/auditRoutes.js");

Admin.findById = async (id) => ({ _id: id });
let home = null, learn = null;
HomeContent.findOne = () => { const r = Promise.resolve(home); r.select = async () => home; return r; };
HomeContent.findOneAndUpdate = async (_q, { $set }) => (home = { ...(home ?? {}), ...$set });
HomeContent.exists = async () => null; HomeContent.distinct = async () => [];
LearningContent.findOne = async () => learn;
LearningContent.findOneAndUpdate = async (_q, { $set }) => (learn = { ...(learn ?? {}), ...$set });

const app = createApp({ allowedOrigins: ["http://localhost:3000"] });
const server = app.listen(0); const base = `http://localhost:${server.address().port}`;
const cookie = `${COOKIE_NAME}=${signAdminToken({ _id: String(new mongoose.Types.ObjectId()) })}`;
const H = { "Content-Type": "application/json", "X-Requested-With": "riththika-admin", Origin: "http://localhost:3000" };
const put = (path, body, auth = true) => fetch(`${base}/api/${path}`, { method: "PUT", headers: { ...H, ...(auth ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
const get = async (path) => (await (await fetch(`${base}/api/${path}`)).json()).data;
let fails = 0; const ok = (n, c) => { console.log(c ? "PASS" : "FAIL", n); if (!c) fails++; };

// ---------- Home: highlights + closing message
const base0 = { name: "Riththika", role: "Full Stack Developer", tagline: "Hello" };
let d = await get("home");
ok("nothing saved: the 4 built-in cards and 'Ready to build.'", d.highlights.length === 4 && d.highlights[0].title === "Web Development" && d.closingMessage === "Ready to build.");
ok("saving the hero WITHOUT highlights keeps the built-in cards", (await put("home", base0)).status === 200 && (await get("home")).highlights.length === 4);
const cards = [{ title: "Backend", description: "APIs", icon: "Server", href: "/skills" }, { title: "My blog", description: "", icon: "Code2", href: "https://example.dev/blog" }];
let r = await put("home", { ...base0, highlights: cards, closingMessage: "Let's build." });
ok("saves custom cards and the closing message", r.status === 200 && (await get("home")).highlights.length === 2 && (await get("home")).closingMessage === "Let's build.");
ok("a later hero-only save leaves the cards alone", (await put("home", { ...base0, tagline: "Changed" })).status === 200 && (await get("home")).highlights.length === 2);
ok("an empty list hides every card (kept as empty)", (await put("home", { ...base0, highlights: [] })).status === 200 && (await get("home")).highlights.length === 0);
ok("rejects javascript: as a card link", (await put("home", { ...base0, highlights: [{ ...cards[0], href: "javascript:alert(1)" }] })).status === 400);
ok("rejects //evil.com as a card link", (await put("home", { ...base0, highlights: [{ ...cards[0], href: "//evil.com" }] })).status === 400);
ok("rejects an unknown icon", (await put("home", { ...base0, highlights: [{ ...cards[0], icon: "Skull" }] })).status === 400);
ok("rejects an empty card title", (await put("home", { ...base0, highlights: [{ ...cards[0], title: " " }] })).status === 400);
ok("rejects more than 8 cards", (await put("home", { ...base0, highlights: Array.from({ length: 9 }, () => cards[0]) })).status === 400);
ok("rejects an empty closing message", (await put("home", { ...base0, closingMessage: " " })).status === 400);
ok("Home PUT still needs login", (await put("home", base0, false)).status === 401);

// ---------- Learning
d = await get("learning");
ok("learning: nothing saved shows the built-in text and 3 tracks", d.tracks.length === 3 && d.tracks[0].label === "React" && d.intro.startsWith("Development skills"));
ok("learning PUT needs login", (await put("learning", { intro: "x", tracks: [] }, false)).status === 401);
ok("learning PUT without the security header is blocked", (await fetch(`${base}/api/learning`, { method: "PUT", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ intro: "x", tracks: [] }) })).status === 403);
r = await put("learning", { intro: "  Always learning  ", tracks: [{ label: " Docker ", level: 2 }, { label: "Node.js", level: 5 }] });
d = await get("learning");
ok("learning saves and trims", r.status === 200 && d.intro === "Always learning" && d.tracks[0].label === "Docker" && d.tracks.length === 2);
ok("learning: empty track list is allowed", (await put("learning", { intro: "x", tracks: [] })).status === 200 && (await get("learning")).tracks.length === 0);
ok("learning rejects level 0 / 6 / 2.5", (await put("learning", { intro: "x", tracks: [{ label: "a", level: 0 }] })).status === 400 && (await put("learning", { intro: "x", tracks: [{ label: "a", level: 6 }] })).status === 400 && (await put("learning", { intro: "x", tracks: [{ label: "a", level: 2.5 }] })).status === 400);
ok("learning rejects an empty intro or track name", (await put("learning", { intro: " ", tracks: [] })).status === 400 && (await put("learning", { intro: "x", tracks: [{ label: " ", level: 3 }] })).status === 400);
ok("learning rejects more than 12 tracks", (await put("learning", { intro: "x", tracks: Array.from({ length: 13 }, (_, i) => ({ label: `t${i}`, level: 3 })) })).status === 400);
ok("audit passes with the new routes", findProblems(collectRoutes(API_ROUTES)).length === 0);
server.close(); console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);