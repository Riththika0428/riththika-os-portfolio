process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const { default: express } = await import("express");
const { default: cookieParser } = await import("cookie-parser");
const { default: Admin } = await import("../src/models/Admin.js");
const { AboutContent } = await import("../src/models/AboutContent.js");
const { default: aboutRoutes } = await import("../src/routes/about.routes.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");
const { notFound, errorHandler } = await import("../src/middleware/errorHandler.js");

Admin.findById = async (id) => ({ _id: id });

// singleton store using REAL mongoose documents so schema casting is exercised
let doc = null;
let lastOpts = null;
AboutContent.findOne = async () => doc;
AboutContent.findOneAndUpdate = async (filter, update, opts) => {
  lastOpts = opts;
  if (!doc) doc = new AboutContent({});
  doc.set(update.$set);
  const err = doc.validateSync();
  if (err) throw err;
  return doc;
};

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/api/about", aboutRoutes);
app.use(notFound);
app.use(errorHandler);
const port = await new Promise((r) => { const s = app.listen(0, () => r(s.address().port)); });
const cookie = `admin_token=${signAdminToken("507f1f77bcf86cd799439011")}`;
const call = async (method, body, auth = true) => {
  const res = await fetch(`http://127.0.0.1:${port}/api/about`, {
    method,
    headers: { "Content-Type": "application/json", ...(auth ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};
let fails = 0;
const check = (name, ok, extra = "") => { console.log(ok ? "PASS" : "FAIL", name, extra); if (!ok) fails++; };

const valid = {
  introParagraphs: ["  Hello world.  ", "Second paragraph."],
  profileFields: [{ label: "Name", value: "Riththika Baskaran" }, { label: "Role", value: "Full Stack Developer" }, { label: "Role", value: "Duplicate label" }],
  journey: [
    { year: "2024", title: "Started Coding", description: "d", tags: ["HTML", "html", " CSS "], now: false },
    { year: "2024", title: "Same year", tags: [] },
    { year: "NOW", title: "Building", description: "d", tags: ["Full-Stack"], now: true },
  ],
};

let r = await call("GET", undefined, false);
check("public GET before seeding -> 404 with message", r.status === 404 && /seeded/.test(r.json.message), r.status);

r = await call("PUT", valid, false);
check("PUT without login -> 401", r.status === 401, r.status);

r = await call("PUT", valid);
check("valid PUT -> 200 (creates the singleton)", r.status === 200 && r.json.success, JSON.stringify(r.json).slice(0, 120));
check("upsert + returnDocument:after + runValidators used", lastOpts.upsert === true && lastOpts.returnDocument === "after" && lastOpts.runValidators === true);
check("paragraphs trimmed", r.json.data.introParagraphs[0] === "Hello world.");
check("profile keys unique", JSON.stringify(r.json.data.profileFields.map((f) => f.key)) === '["name","role","role-2"]', JSON.stringify(r.json.data.profileFields.map((f) => f.key)));
check("journey keys unique", JSON.stringify(r.json.data.journey.map((j) => j.key)) === '["2024","2024-2","now"]', JSON.stringify(r.json.data.journey.map((j) => j.key)));
check("tags deduped + trimmed", JSON.stringify(r.json.data.journey[0].tags) === '["HTML","CSS"]', JSON.stringify(r.json.data.journey[0].tags));
check("missing description defaults to empty", r.json.data.journey[1].description === "");
check("now flag saved", r.json.data.journey[2].now === true && r.json.data.journey[0].now === false);

r = await call("GET", undefined, false);
check("public GET returns saved content", r.status === 200 && r.json.data.journey.length === 3 && r.json.data.introParagraphs.length === 2);

r = await call("PUT", { ...valid, introParagraphs: [] });
check("no paragraphs -> 400", r.status === 400 && /at least one paragraph/.test(r.json.message), r.json.message);
r = await call("PUT", { ...valid, introParagraphs: ["ok", "   "] });
check("blank paragraph -> 400", r.status === 400, r.json.message);
r = await call("PUT", { ...valid, profileFields: [{ label: "", value: "x" }] });
check("empty label -> 400", r.status === 400 && /label/i.test(r.json.message), r.json.message);
r = await call("PUT", { ...valid, journey: [{ year: "", title: "t" }] });
check("empty year -> 400", r.status === 400, r.json.message);
r = await call("PUT", { ...valid, journey: [{ year: "1", title: "a", now: true }, { year: "2", title: "b", now: true }] });
check("two NOW entries -> 400", r.status === 400 && /Only one/.test(r.json.message), r.json.message);
r = await call("PUT", { ...valid, introParagraphs: ["x".repeat(1501)] });
check("paragraph too long -> 400", r.status === 400, r.json.message);
r = await call("PUT", { ...valid, journey: undefined, profileFields: undefined });
check("journey/profile optional -> 200 and cleared", r.status === 200 && r.json.data.journey.length === 0 && r.json.data.profileFields.length === 0, r.status);
r = await call("PUT", { ...valid, extra: "ignored", _id: "x" });
check("unknown fields are stripped", r.status === 200 && !("extra" in r.json.data));

console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);