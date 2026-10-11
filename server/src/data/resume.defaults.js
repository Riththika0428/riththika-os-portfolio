// Shown on the public Resume page (and pre-filled in the admin) until the first Save.
// Same wording the page used when it was hard-coded. GitHub/LinkedIn/email are left empty
// on purpose: the page hides empty details instead of showing "your-username" placeholders.
export const RESUME_DEFAULTS = {
  headline: "Full Stack Developer | BIT Undergraduate",
  contact: {
    location: "Sri Lanka",
    availability: "Available for Opportunities",
    email: "",
    github: "",
    linkedin: "",
  },
  summary:
    "Full Stack Developer and BIT undergraduate at the University of Moratuwa, with hands-on full-stack training from Uki Technology School. Builds clean, responsive interfaces and scalable backend systems using Next.js, Express, and MongoDB, with a continuous focus on software engineering fundamentals and real-world project development.",
  skillGroups: [
    { key: "frontend-development", label: "Frontend Development", items: ["React", "Next.js", "JavaScript (ES6+)", "Tailwind CSS", "HTML", "CSS"] },
    { key: "backend-architecture", label: "Backend Architecture", items: ["Node.js", "Express.js", "REST APIs"] },
    { key: "databases-storage", label: "Databases & Storage", items: ["MongoDB", "MySQL", "PostgreSQL"] },
    { key: "tools-engineering-practices", label: "Tools & Engineering Practices", items: ["Git", "GitHub", "VS Code", "Postman", "Figma"] },
  ],
  experience:
    "Continuous, project-based software engineering practice — building full-stack applications end to end, working through real technical problems, and strengthening backend, database, and system design skills alongside formal study.",
  achievements: [],
  pdfUrl: "",
  projects: { mode: "all", slugs: [] },
};