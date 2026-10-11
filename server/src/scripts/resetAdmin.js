import "dotenv/config";
import readline from "node:readline/promises";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

await connectDB();

const existing = await Admin.find().select("email");
console.log(`Database: ${mongoose.connection.name}`);
console.log(existing.length ? `Admin accounts: ${existing.map((a) => a.email).join(", ")}` : "Admin accounts: none");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question("Admin email: ")).trim().toLowerCase();
const password = await rl.question("New password (12+ characters, visible while typing): ");
rl.close();

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error("That doesn't look like a valid email.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

// Only one admin is allowed: update the existing one, or create the first.
if (existing.length > 0) {
  await Admin.findByIdAndUpdate(existing[0]._id, { email, passwordHash });
} else {
  await Admin.create({ email, passwordHash });
}

const saved = await Admin.findOne({ email }).select("+passwordHash");
const ok = saved && (await bcrypt.compare(password, saved.passwordHash));
console.log(ok ? `Done. Password check: OK for ${email}` : "Password check: FAILED, something is wrong.");

await mongoose.disconnect();