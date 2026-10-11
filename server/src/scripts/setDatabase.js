import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import mongoose from "mongoose";

if (process.env.MONGODB_URI) {
  console.warn("\nWARNING: MONGODB_URI is set in your terminal and overrides .env.");
  console.warn("Run: unset MONGODB_URI   (then open a new terminal)\n");
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("Take these from Atlas: Database -> Connect -> Drivers.");
console.log("Host looks like: cluster0.abcde.mongodb.net\n");

const rawHost = await rl.question("Host: ");
const user = (await rl.question("Database username: ")).trim();
const password = await rl.question("Database password (visible while typing): ");
const dbName = (await rl.question("Database name [riththika-portfolio]: ")).trim() || "riththika-portfolio";
rl.close();

const host = rawHost
  .trim()
  .replace(/^mongodb(\+srv)?:\/\//, "")
  .replace(/^[^/]*@/, "")
  .replace(/[/?].*$/, "");

const uri =
  `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}` +
  `@${host}/${encodeURIComponent(dbName)}?retryWrites=true&w=majority`;

console.log(`\nTesting connection to ${host} ...`);
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
} catch (e) {
  const nodeErrors = e.reason?.servers
    ? [...e.reason.servers.values()].map((s) => s.error?.message ?? "").join(" ")
    : "";
  const text = `${e.message} ${nodeErrors}`;
  console.error("\nFAILED. Nothing was saved.");
  if (/bad auth|authentication failed/i.test(text)) {
    console.error("-> Wrong database username or password. Atlas: Security -> Database Access -> Edit user -> set a new password.");
  } else if (/ENOTFOUND|querySrv|ECONNREFUSED/i.test(text)) {
    console.error("-> The host name is wrong, or DNS/internet is failing. Re-copy the host from Atlas (Connect -> Drivers).");
  } else if (/tlsv1 alert|ssl/i.test(text) || e.reason) {
    console.error("-> Atlas answered but closed the secure connection. That means one of:");
    console.error("   1. The cluster is PAUSED (Atlas -> Database -> Resume).");
    console.error("   2. This IP isn't allowed (Atlas -> Security -> Network Access -> add 0.0.0.0/0, wait for Active).");
    console.error("   3. You're looking at a different Atlas PROJECT than the one that owns this cluster.");
  } else {
    console.error(`-> ${e.name}: ${e.message}`);
  }
  process.exit(1);
}

console.log(`Connected to database "${mongoose.connection.name}".`);
await mongoose.disconnect();

// Rewrite .env: drop every old MONGODB_URI line, add exactly one.
const envPath = path.resolve(process.cwd(), ".env");
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const kept = existing
  .split(/\r?\n/)
  .filter((line) => !/^\s*(export\s+)?MONGODB_URI\s*=/.test(line));
while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();
fs.writeFileSync(envPath, `${kept.join("\n")}\nMONGODB_URI=${uri}\n`);
console.log(`Saved MONGODB_URI to ${envPath}`);
console.log("\nNext: npm run seed -- --force && npm run reset-admin");