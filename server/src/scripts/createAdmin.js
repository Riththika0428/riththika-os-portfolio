import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env first.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

await connectDB();

if ((await Admin.countDocuments()) > 0) {
  console.error("An admin already exists. This script only creates the first one.");
} else {
  await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Admin created: ${email}`);
}

await mongoose.disconnect();