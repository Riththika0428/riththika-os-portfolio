import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import skillsRoutes from "./routes/skills.routes.js";
import educationRoutes from "./routes/education.routes.js";
import aboutRoutes from "./routes/about.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import profileImageRoutes from "./routes/profileImage.routes.js";
import projectImageRoutes from "./routes/projectImage.routes.js";
import certificationRoutes from "./routes/certification.routes.js";
import { csrfGuard } from "./middleware/csrfGuard.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// One list for both the app and `npm run audit`, so the audit always checks what really runs.
export const API_ROUTES = [
  ["/api/auth", authRoutes],
  ["/api/admin", adminRoutes],
  ["/api/projects", projectsRoutes],
  ["/api/skills", skillsRoutes],
  ["/api/education", educationRoutes],
  ["/api/about", aboutRoutes],
  ["/api/contact", contactRoutes],
  ["/api/resume", resumeRoutes],
  ["/api/profile-image", profileImageRoutes],
  ["/api/project-images", projectImageRoutes],
  ["/api/certifications", certificationRoutes],
];

export function createApp({ allowedOrigins, isProd = false, logRequests = false }) {
  const app = express();
  if (isProd) app.set("trust proxy", 1); // correct client IPs behind Render/Railway

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  if (logRequests) app.use(morgan("dev"));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  // Admin data and login state must never be stored by browsers or proxies.
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", csrfGuard(allowedOrigins));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "riththika-os-backend" }));
  for (const [path, router] of API_ROUTES) app.use(path, router);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}