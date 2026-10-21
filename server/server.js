import "dotenv/config"; // must be the FIRST import so env vars exist for every module
import { connectDB } from "./src/config/db.js";
import { createApp } from "./src/app.js";
import { parseOrigins } from "./src/config/env.js";

const { PORT = 5000, CLIENT_URL, ADMIN_AUTH_SECRET, NODE_ENV } = process.env;
const isProd = NODE_ENV === "production";

let allowedOrigins;
try {
  allowedOrigins = parseOrigins(CLIENT_URL);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
if (!ADMIN_AUTH_SECRET || ADMIN_AUTH_SECRET.length < 32) {
  console.error("ADMIN_AUTH_SECRET must be set and at least 32 characters");
  process.exit(1);
}
if (isProd && allowedOrigins.some((o) => !o.startsWith("https://"))) {
  console.warn("[security] CLIENT_URL should use https:// in production");
}

const app = createApp({ allowedOrigins, isProd, logRequests: NODE_ENV !== "test" });

await connectDB();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT} (allowed origin: ${allowedOrigins.join(", ")})`));