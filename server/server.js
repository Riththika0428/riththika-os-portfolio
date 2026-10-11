import "dotenv/config"; // must be the FIRST import so env vars exist for every module
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import projectsRoutes from "./src/routes/projects.routes.js";
import skillsRoutes from "./src/routes/skills.routes.js";
import educationRoutes from "./src/routes/education.routes.js";
import aboutRoutes from "./src/routes/about.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";
import resumeRoutes from "./src/routes/resume.routes.js";

const { PORT = 5000, CLIENT_URL, ADMIN_AUTH_SECRET, NODE_ENV } = process.env;

if (!CLIENT_URL) {
  console.error("CLIENT_URL is not set");
  process.exit(1);
}
if (!ADMIN_AUTH_SECRET || ADMIN_AUTH_SECRET.length < 32) {
  console.error("ADMIN_AUTH_SECRET must be set and at least 32 characters");
  process.exit(1);
}

const app = express();
if (NODE_ENV === "production") app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
if (NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "riththika-os-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/resume", resumeRoutes);

app.use(notFound);
app.use(errorHandler);

await connectDB();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));