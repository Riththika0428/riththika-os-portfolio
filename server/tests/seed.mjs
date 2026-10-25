const { planSeed, seedDatabase } = await import("../src/scripts/seed.js");
let fails = 0;
const check = (name, ok, extra = "") => { console.log(ok ? "PASS" : "FAIL", name, extra); if (!ok) fails++; };

const fake = (name, existing, docs) => {
  const store = Array.from({ length: existing }, (_, i) => ({ old: i }));
  return { name, docs, store, calls: [], model: {
    countDocuments: async () => store.length,
    deleteMany: async () => { store.length = 0; fake.calls.push(`delete ${name}`); },
    insertMany: async (d) => { store.push(...d); fake.calls.push(`insert ${name}`); },
  } };
};
fake.calls = [];
const quiet = () => {};

let t = [fake("projects", 5, [{ a: 1 }]), fake("education", 0, [{ b: 1 }, { b: 2 }])];
let plan = await seedDatabase(t, false, quiet);
check("default run SKIPS a collection that already has data", plan[0].action === "skip" && t[0].store.length === 5 && !fake.calls.includes("delete projects"));
check("default run fills an EMPTY collection", plan[1].action === "insert" && t[1].store.length === 2);

fake.calls = [];
t = [fake("projects", 5, [{ a: 1 }]), fake("about page", 1, [{ intro: "x" }])];
plan = await seedDatabase(t, true, quiet);
check("--force replaces existing data (delete then insert)", plan.every((p) => p.action === "replace") && t[0].store.length === 1 && t[0].store[0].a === 1);
check("--force deletes before inserting", fake.calls.indexOf("delete projects") < fake.calls.indexOf("insert projects"));

fake.calls = [];
t = [fake("projects", 0, [{ a: 1 }])];
plan = await seedDatabase(t, true, quiet);
check("--force on an empty collection just inserts (no delete)", plan[0].action === "insert" && !fake.calls.includes("delete projects") && t[0].store.length === 1);

const p = planSeed([{ name: "x" }, { name: "y" }], { x: 3, y: 0 }, false);
check("planSeed is pure and predictable", p[0].action === "skip" && p[1].action === "insert");

console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);