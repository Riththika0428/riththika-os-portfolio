/**
 * Self-assessed learning status — no percentage, matching the same
 * icon + colored level pill pattern used on the Skills page's Core
 * Proficiencies section. `level` is 1-5 (see SkillLevelCard for labels).
 */
export const LEARNING_ITEMS = [
  { key: "react", label: "React", level: 4 },
  { key: "typescript", label: "TypeScript", level: 3 },
  { key: "system-design", label: "System Design", level: 2 },
];

export const QUICK_SKILLS = [
  {
    key: "web",
    title: "Web Development",
    description: "Responsive, accessible interfaces built with React and Next.js.",
    icon: "Layout",
    href: "/skills",
  },
  {
    key: "backend",
    title: "Backend Development",
    description: "REST APIs and services with Node.js, Express, and MongoDB.",
    icon: "Server",
    href: "/skills",
  },
  {
    key: "uiux",
    title: "UI / UX",
    description: "Clean, purposeful interfaces designed with real users in mind.",
    icon: "PenTool",
    href: "/skills",
  },
  {
    key: "deployment",
    title: "Deployment",
    description: "Shipping and maintaining full-stack apps in production.",
    icon: "Rocket",
    href: "/projects",
  },
];

// Text shown until the admin saves their own (Admin → Home / Learning).
export const CLOSING_MESSAGE = "Ready to build.";
export const LEARNING_INTRO =
  "Development skills are continuously improved through personal projects, documentation, coding practice and real-world development.";