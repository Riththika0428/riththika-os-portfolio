export const SKILL_CATEGORIES = [
  {
    key: "frontend",
    title: "Frontend",
    icon: "Layout",
    skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS"],
  },
  {
    key: "backend",
    title: "Backend",
    icon: "Server",
    skills: ["Node.js", "Express.js", "REST APIs"],
  },
  {
    key: "programming",
    title: "Programming",
    icon: "Code2",
    skills: ["JavaScript ES6+", "Python", "Java", "C#"],
  },
  {
    key: "databases",
    title: "Databases",
    icon: "Database",
    skills: ["MongoDB", "MySQL", "PostgreSQL"],
  },
  {
    key: "tools",
    title: "Tools",
    icon: "Wrench",
    skills: ["Git", "GitHub", "VS Code", "Postman", "Figma"],
  },
  {
    key: "learning",
    title: "Currently Learning",
    icon: "Sparkles",
    skills: ["TypeScript", "System Design", "Cloud", "DevOps"],
    highlight: true,
  },
];

/**
 * Self-assessed skill level for a handful of core skills — personal
 * learning progress, not a certification or benchmark. `level` is 1-5
 * (rendered as filled/empty dots), chosen by Riththi herself and meant
 * to be edited directly by her, not treated as an objective figure.
 */
