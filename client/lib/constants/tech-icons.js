import {
  Webhook,
  Hash,
  SquareCode,
  Network,
  Cloud,
  GitBranch,
} from "lucide-react";
import {
  siHtml5,
  siCss,
  siJavascript,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siNodedotjs,
  siExpress,
  siPython,
  siOpenjdk,
  siMongodb,
  siMysql,
  siPostgresql,
  siGit,
  siGithub,
  siPostman,
  siFigma,
  siTypescript,
} from "simple-icons";

export const TECH_ICON_MAP = {
  HTML: siHtml5,
  CSS: siCss,
  JavaScript: siJavascript,
  React: siReact,
  "Next.js": siNextdotjs,
  "Tailwind CSS": siTailwindcss,
  "Node.js": siNodedotjs,
  "Express.js": siExpress,
  "JavaScript ES6+": siJavascript,
  Python: siPython,
  Java: siOpenjdk,
  MongoDB: siMongodb,
  MySQL: siMysql,
  PostgreSQL: siPostgresql,
  Git: siGit,
  GitHub: siGithub,
  Postman: siPostman,
  Figma: siFigma,
  TypeScript: siTypescript,
};

/**
 * Generic fallback icons for skills with no real brand logo available
 * in simple-icons (REST APIs, C#, VS Code), or where a lucide icon
 * reads better than forcing a brand mark (System Design, Cloud, DevOps).
 * Shared between the Skills page and the Home page's Currently Learning
 * panel so both stay consistent.
 */
export const FALLBACK_ICON_MAP = {
  "REST APIs": Webhook,
  "C#": Hash,
  "VS Code": SquareCode,
  "System Design": Network,
  Cloud: Cloud,
  DevOps: GitBranch,
};