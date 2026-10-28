import "dotenv/config";
import { connectDB } from "../src/config/db.js";
import { createApp } from "../src/app.js";
import { parseOrigins } from "../src/config/env.js";

const { CLIENT_URL, ADMIN_AUTH_SECRET, NODE_ENV } = process.env;
const isProd = NODE_ENV === "production";

if (!ADMIN_AUTH_SECRET || ADMIN_AUTH_SECRET.length < 32) {
  throw new Error("ADMIN_AUTH_SECRET must be set and at least 32 characters");
}

const allowedOrigins = parseOrigins(CLIENT_URL);

if (isProd && allowedOrigins.some((origin) => !origin.startsWith("https://"))) {
  console.warn("CLIENT_URL should use HTTPS in production");
}

await connectDB();

const app = createApp({
  allowedOrigins,
  isProd,
  logRequests: false,
});

export default app;