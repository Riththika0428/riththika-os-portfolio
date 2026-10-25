process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const { default: express } = await import("express");
const { default: cookieParser } = await import("cookie-parser");
const { default: Admin } = await import("../src/models/Admin.js");
const { EducationEntry } = await import("../src/models/EducationEntry.js");
const { default: educationRoutes } = await import("../src/routes/education.routes.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");
const { notFound, errorHandler } = await import("../src/middleware/errorHandler.js");

Admin.findById = async (id) => ({ _id: id, email: "admin@example.com" });

function fakeModel(Model, seed) {
  const store = [];
  const wrap = (doc) => {
    doc.save = async function () { const e = this.validateSync(); if (e) throw e; return this; };
    return doc;
  };
  seed.forEach((d) => store.push(wrap(new Model(d))));
  Model.find = () => ({ sort: async () => [...store].sort((a, b) => a.order - b.order) });
  Model.findOne = () => ({
    sort: () => ({ select: async () => (store.length ? { order: Math.max(...store.map((d) => d.order)) } : null) }),
  });
  Model.findById = async (id) => store.find((d) => String(d._id) === String(id)) ?? null;
  Model.create = async (data) => {
    if (store.some((d) => d.key === data.key)) { const e = new Error("dup"); e.code = 11000; throw e; }
    const doc = wrap(new Model(data));
    const err = doc.validateSync();
    if (err) throw err;
    store.push(doc);
    return doc;
  };
  Model.findByIdAndDelete = async (id) => {
    const i = store.findIndex((d) => String(d._id) === String(id));
    return i < 0 ? null : store.splice(i, 1)[0];
  };
  Model.bulkWrite = async (ops) => {
    ops.forEach((op) => {
      const d = store.find((x) => String(x._id) === String(op.updateOne.filter._id));
      if (d) d.order = op.updateOne.update.$set.order;
    });
  };
  return store;
}
// Same two records as your seed data (they have no dates yet)
fakeModel(EducationEntry, [
  { key: "moratuwa", tag: "DEGREE PROGRAM // 01", status: "Currently Studying", statusColor: "cyan", current: true,
    degree: "Bachelor of Information Technology", institution: "University of Moratuwa", description: "d", subjects: ["Web Programming"], order: 1 },
  { key: "uki", tag: "TRAINING PROGRAM // 02", status: "Completed", statusColor: "mint", current: false,
    degree: "Full Stack Development", institution: "Uki Technology School", description: "d", subjects: ["Git/GitHub"], order: 2 },
]);

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/api/education", educationRoutes);
app.use(notFound);
app.use(errorHandler);
const port = await new Promise((r) => { const s = app.listen(0, () => r(s.address().port)); });

const cookie = `admin_token=${signAdminToken("507f1f77bcf86cd799439011")}`;
const call = async (method, path, body, auth = true) => {
  const res = await fetch(`http://127.0.0.1:${port}/api/education${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(auth ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};

let fails = 0;
const check = (name, ok, extra = "") => { console.log(ok ? "PASS" : "FAIL", name, extra); if (!ok) fails++; };

const valid = {
  institution: "SLIIT", degree: "Diploma in Cloud Computing", tag: "", status: "Currently Studying",
  startDate: "2026-03", endDate: "", description: "Cloud basics", subjects: ["AWS", "Docker", "aws", " Linux "],
};

let r = await call("GET", "", undefined, false);
check("public GET /api/education", r.status === 200 && r.json.data.entries.length === 2, `status ${r.status}`);

r = await call("POST", "", valid, false);
check("POST without login -> 401", r.status === 401, `status ${r.status}`);

r = await call("POST", "", valid);
const e1 = r.json?.data?.entry;
check("POST valid -> 201, derived fields", r.status === 201 && e1?.key === "sliit-diploma-in-cloud-computing" && e1.statusColor === "cyan" && e1.current === true && e1.order === 3 && e1.subjects.length === 3 && e1.startDate === "2026-03",
  `status ${r.status} key=${e1?.key} color=${e1?.statusColor} current=${e1?.current} order=${e1?.order} subjects=${JSON.stringify(e1?.subjects)}`);

r = await call("POST", "", { ...valid, institution: "  " });
check("POST empty institution -> 400 with message", r.status === 400 && /Institution is required/.test(r.json?.message ?? ""), `"${r.json?.message}"`);

r = await call("POST", "", { ...valid, status: "Whatever" });
check("POST invalid status -> 400", r.status === 400, `"${r.json?.message}"`);

r = await call("POST", "", { ...valid, startDate: "2024-13" });
check("POST invalid month -> 400", r.status === 400, `"${r.json?.message}"`);

r = await call("POST", "", { ...valid, institution: "Other", startDate: "2026-05", endDate: "2026-01" });
check("POST end before start -> 400", r.status === 400 && /End date/.test(r.json?.message ?? ""), `"${r.json?.message}"`);

r = await call("POST", "", valid);
check("POST duplicate institution+degree -> 409", r.status === 409, `"${r.json?.message}"`);

r = await call("PUT", `/${e1._id}`, { ...valid, status: "Completed", endDate: "2026-09" });
check("PUT status change updates colour/current, keeps key",
  r.status === 200 && r.json.data.entry.statusColor === "mint" && r.json.data.entry.current === false && r.json.data.entry.key === "sliit-diploma-in-cloud-computing" && r.json.data.entry.endDate === "2026-09",
  `status ${r.status}`);

r = await call("PUT", "/abc", valid);
check("PUT bad id -> 400", r.status === 400, `status ${r.status}`);
r = await call("PUT", "/507f1f77bcf86cd799439099", valid);
check("PUT unknown id -> 404", r.status === 404, `status ${r.status}`);

let g = await call("GET", "", undefined, false);
const ids = g.json.data.entries.map((x) => x._id).reverse();
r = await call("PUT", "/reorder", { ids });
g = await call("GET", "", undefined, false);
check("PUT reorder changes public order", r.status === 200 && g.json.data.entries[0]._id === ids[0], `first=${g.json.data.entries[0].institution}`);
r = await call("PUT", "/reorder", { ids: ["nope"] });
check("PUT reorder with bad ids -> 400", r.status === 400, `status ${r.status}`);

r = await call("DELETE", `/${e1._id}`);
check("DELETE -> 200", r.status === 200, `status ${r.status}`);
r = await call("DELETE", `/${e1._id}`);
check("DELETE again -> 404", r.status === 404, `status ${r.status}`);
r = await call("DELETE", `/${e1._id}`, undefined, false);
check("DELETE without login -> 401", r.status === 401, `status ${r.status}`);

console.log(fails ? `\nFAILURES: ${fails}` : "\nALL EDUCATION API CHECKS PASSED");
process.exit(fails ? 1 : 0);