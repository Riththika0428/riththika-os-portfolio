process.env.ADMIN_AUTH_SECRET = "t".repeat(48);
process.env.NODE_ENV = "test";
const { default: express } = await import("express");
const { default: cookieParser } = await import("cookie-parser");
const { Query } = await import("mingo");
const { default: Admin } = await import("../src/models/Admin.js");
const { ContactMessage } = await import("../src/models/ContactMessage.js");
const { default: contactRoutes } = await import("../src/routes/contact.routes.js");
const { signAdminToken } = await import("../src/utils/authCookie.js");
const { notFound, errorHandler } = await import("../src/middleware/errorHandler.js");

Admin.findById = async (id) => ({ _id: id });

// In-memory model. Filters are evaluated by `mingo`, a real MongoDB query engine, so the
// exact objects the controller builds ($or, $regex, $options, read flags) are really executed.
const store = [];
let clock = Date.UTC(2026, 9, 1);
const add = (data) => {
  const doc = new ContactMessage(data);
  const err = doc.validateSync();
  if (err) throw err;
  doc.receivedAt = new Date((clock += 60_000));
  store.push(doc);
  return doc;
};
const match = (where) => store.filter((d) => new Query(where).test(d.toObject()));
let lastWhere = null;
ContactMessage.create = async (data) => add(data);
ContactMessage.find = (where) => {
  lastWhere = where;
  let rows = match(where), skip = 0, lim = Infinity;
  const chain = {
    sort: () => { rows = [...rows].sort((a, b) => b.receivedAt - a.receivedAt); return chain; },
    skip: (n) => { skip = n; return chain; },
    limit: (n) => { lim = n; return chain; },
    then: (res, rej) => Promise.resolve(rows.slice(skip, skip + lim)).then(res, rej),
  };
  return chain;
};
ContactMessage.countDocuments = async (where = {}) => match(where).length;
ContactMessage.findByIdAndUpdate = async (id, update) => {
  const d = store.find((x) => String(x._id) === String(id));
  if (!d) return null;
  d.set(update.$set);
  return d;
};
ContactMessage.updateMany = async (where, update) => {
  const rows = match(where);
  rows.forEach((d) => d.set(update.$set));
  return { modifiedCount: rows.length };
};
ContactMessage.findByIdAndDelete = async (id) => {
  const i = store.findIndex((d) => String(d._id) === String(id));
  return i < 0 ? null : store.splice(i, 1)[0];
};

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/api/contact", contactRoutes);
app.use(notFound);
app.use(errorHandler);
const port = await new Promise((r) => { const s = app.listen(0, () => r(s.address().port)); });
const cookie = `admin_token=${signAdminToken("507f1f77bcf86cd799439011")}`;
const call = async (method, path, body, auth = true) => {
  const res = await fetch(`http://127.0.0.1:${port}/api/contact${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(auth ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};
let fails = 0;
const check = (name, ok, extra = "") => { console.log(ok ? "PASS" : "FAIL", name, extra); if (!ok) fails++; };

/* ----- public POST (limiter allows 5/hour, so keep to 5 valid-or-invalid requests) ----- */
let r = await call("POST", "", { name: "Nimal", email: "nimal@example.com", subject: "  Hi  ", message: " Hello there " }, false);
check("public POST ok -> 201 + data.id", r.status === 201 && r.json.success && r.json.data.id, r.status);
check("fields trimmed", store[0].subject === "Hi" && store[0].message === "Hello there" && store[0].read === false);

r = await call("POST", "", { name: "Kamal", email: "kamal@example.com", subject: "   ", message: "No subject" }, false);
check("blank subject -> model default", r.status === 201 && store[1].subject === "(no subject)", store[1]?.subject);

r = await call("POST", "", { name: "X", email: "not-an-email", message: "m" }, false);
check("bad email -> 400", r.status === 400 && /valid email/.test(r.json.message), r.json.message);

r = await call("POST", "", { name: { $ne: 1 }, email: "a@b.co", message: ["x"] }, false);
check("non-string fields -> 400 (used to crash with 500)", r.status === 400, `${r.status} ${r.json.message}`);

r = await call("POST", "", { name: "Z", email: "z@z.co", message: "m".repeat(5001) }, false);
check("message > 5000 -> 400", r.status === 400, r.json.message);

r = await call("POST", "", { name: "Late", email: "late@example.com", message: "sixth request" }, false);
check("6th public POST in the hour is rate limited -> 429", r.status === 429, r.status);

// Seed more through the model directly so the admin tests have variety
add({ name: "Sanduni", email: "sanduni@work.lk", subject: "Internship", message: "We'd love to talk about an internship.", read: true });
add({ name: "Ruwan", email: "ruwan@mail.com", subject: "Invoice (urgent) [1]", message: "Cost is 5+5 = 10? or 5.5*2" });
add({ name: "Dilini", email: "dilini@mail.com", subject: "Collab", message: "Let's collaborate on React." });
// store (oldest->newest): Nimal(unread) Kamal(unread) Sanduni(read) Ruwan(unread) Dilini(unread)

/* ----- admin auth ----- */
for (const [m, p, b] of [["GET", ""], ["POST", "/read-all"], ["PATCH", "/507f1f77bcf86cd799439011", { read: true }], ["DELETE", "/507f1f77bcf86cd799439011"]]) {
  r = await call(m, p, b, false);
  check(`${m} ${p || "/"} without login -> 401`, r.status === 401, r.status);
}

/* ----- list ----- */
r = await call("GET", "");
check("list: newest first", r.status === 200 && r.json.data.messages.map((x) => x.name).join() === "Dilini,Ruwan,Sanduni,Kamal,Nimal", r.json.data.messages.map((x) => x.name).join());
check("list: counts", r.json.data.total === 5 && r.json.data.unread === 4 && r.json.data.totalAll === 5 && r.json.data.pages === 1);

r = await call("GET", "?filter=unread");
check("filter=unread", r.json.data.messages.length === 4 && r.json.data.messages.every((x) => !x.read) && r.json.data.total === 4);
r = await call("GET", "?filter=read");
check("filter=read", r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Sanduni" && r.json.data.unread === 4);

r = await call("GET", "?q=internship");
check("search is case-insensitive across subject/message", r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Sanduni");
r = await call("GET", "?q=KAMAL@EXAMPLE");
check("search matches email", r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Kamal");
r = await call("GET", "?q=" + encodeURIComponent("(urgent) [1]"));
check("search with regex characters is treated literally", r.status === 200 && r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Ruwan", `${r.status} ${r.json.message ?? ""}`);
r = await call("GET", "?q=" + encodeURIComponent("5+5"));
check("'5+5' matches literally (not as regex)", r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Ruwan");
r = await call("GET", "?q=" + encodeURIComponent(".*"));
check("'.*' does not match everything", r.json.data.messages.length === 0, r.json.data.messages.length);
r = await call("GET", "?q=" + encodeURIComponent("("));
check("unbalanced '(' doesn't crash and matches literally (Ruwan's subject and Kamal's '(no subject)')", r.status === 200 && r.json.data.messages.map((x) => x.name).sort().join() === "Kamal,Ruwan", r.status);
r = await call("GET", "?filter=unread&q=react");
check("filter + search combine", r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Dilini" && r.json.data.total === 1);
r = await call("GET", "?q[$ne]=x");
check("q[$ne] is not parsed into an operator object (Express simple parser): query ignored, no injection", r.status === 200 && lastWhere && !JSON.stringify(lastWhere).includes("$ne"), JSON.stringify(lastWhere));

r = await call("GET", "?limit=2&page=1");
check("pagination page 1", r.json.data.messages.length === 2 && r.json.data.pages === 3 && r.json.data.total === 5);
r = await call("GET", "?limit=2&page=3");
check("pagination last page", r.json.data.messages.length === 1 && r.json.data.messages[0].name === "Nimal");
r = await call("GET", "?page=0"); check("page=0 -> 400", r.status === 400);
r = await call("GET", "?limit=500"); check("limit=500 -> 400", r.status === 400);
r = await call("GET", "?filter=bogus"); check("bad filter -> 400", r.status === 400);

/* ----- mark read / unread ----- */
const nimalId = String(store[0]._id);
r = await call("PATCH", `/${nimalId}`, { read: true });
check("PATCH read:true", r.status === 200 && r.json.data.message.read === true && store[0].read === true);
r = await call("PATCH", `/${nimalId}`, { read: false });
check("PATCH read:false (mark unread)", r.json.data.message.read === false);
r = await call("PATCH", `/${nimalId}`, { read: "yes" });
check("PATCH non-boolean -> 400", r.status === 400);
r = await call("PATCH", `/${nimalId}`, { name: "Hacker" });
check("PATCH can't change other fields", r.status === 400 && store[0].name === "Nimal");
r = await call("PATCH", "/not-an-id", { read: true });
check("PATCH bad id -> 400", r.status === 400);
r = await call("PATCH", "/507f1f77bcf86cd799439011", { read: true });
check("PATCH unknown id -> 404", r.status === 404);

/* ----- read all ----- */
r = await call("POST", "/read-all");
check("read-all updates the 4 unread", r.status === 200 && r.json.data.updated === 4 && store.every((d) => d.read));
r = await call("POST", "/read-all");
check("read-all again -> 0", r.json.data.updated === 0);
r = await call("GET", "");
check("unread is now 0", r.json.data.unread === 0);

/* ----- delete ----- */
r = await call("DELETE", `/${nimalId}`);
check("DELETE -> 200", r.status === 200 && store.length === 4);
r = await call("DELETE", `/${nimalId}`);
check("DELETE again -> 404", r.status === 404);
r = await call("DELETE", "/xyz");
check("DELETE bad id -> 400", r.status === 400);

console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);