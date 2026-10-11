export const RESUME_CONTACT = {
  location: "Sri Lanka",
  availability: "Available for Opportunities",
  github: "github.com/your-username", // update with your real GitHub handle
  linkedin: "linkedin.com/in/your-username", // update with your real LinkedIn handle
};

export const RESUME_SUMMARY =
  "Full Stack Developer and BIT undergraduate at the University of Moratuwa, with hands-on full-stack training from Uki Technology School. Builds clean, responsive interfaces and scalable backend systems using Next.js, Express, and MongoDB, with a continuous focus on software engineering fundamentals and real-world project development.";

/**
 * Condensed skill groups for the printable resume — a simpler, comma-list
 * presentation than the badge grid on the Skills page. Kept as its own
 * data set (rather than reusing SKILL_CATEGORIES directly) since a resume
 * traditionally groups things a little differently than a web skills page.
 */
export const RESUME_SKILL_GROUPS = [
  {
    key: "frontend",
    label: "Frontend Development",
    items: "React, Next.js, JavaScript (ES6+), Tailwind CSS, HTML, CSS",
  },
  {
    key: "backend",
    label: "Backend Architecture",
    items: "Node.js, Express.js, REST APIs",
  },
  {
    key: "databases",
    label: "Databases & Storage",
    items: "MongoDB, MySQL, PostgreSQL",
  },
  {
    key: "tools",
    label: "Tools & Engineering Practices",
    items: "Git, GitHub, VS Code, Postman, Figma",
  },
];

/**
 * "Achievements" — intentionally empty for now. Rather than inventing
 * awards or recognitions that haven't happened, this renders an honest
 * placeholder until real entries exist. Add objects shaped like
 * { title, description } once there's something real to list.
 */
export const RESUME_ACHIEVEMENTS = [];