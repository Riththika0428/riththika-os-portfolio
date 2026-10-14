export const SITE = {
  name: "Riththika OS",
  author: "Riththika Baskaran",
  tagline: "A developer operating system.",
  description:
    "The personal portfolio of Riththika Baskaran, presented as a simulated developer operating system.",
  url: "https://riththika-os.dev", // placeholder — update when deployed
   avatar: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/profile-image`,
};

/**
 * Central route registry.
 * Single source of truth for the Sidebar nav (and, from Phase 4 onward,
 * anywhere else navigation needs to be rendered). `icon` is a lucide-react
 * icon name, resolved via the NAV_ICONS map in Sidebar.jsx so this file
 * stays framework-agnostic. `fileLabel` mirrors the design's "file path"
 * flavor text shown next to each nav item (e.g. "about-me.txt").
 */
export const ROUTES = [
  { key: "home", label: "Home", path: "/", icon: "Home", fileLabel: "welcome.sh" },
  { key: "about", label: "About Me", path: "/about", icon: "User", fileLabel: "about-me.txt" },
  { key: "projects", label: "Projects", path: "/projects", icon: "FolderGit2", fileLabel: "projects.sh" },
  { key: "skills", label: "Skills", path: "/skills", icon: "Wrench", fileLabel: "--all" },
  { key: "education", label: "Education", path: "/education", icon: "GraduationCap", fileLabel: "education.txt" },
  { key: "resume", label: "Resume", path: "/resume", icon: "FileText", fileLabel: "resume.pdf" },
  { key: "contact", label: "Contact", path: "/contact", icon: "Mail", fileLabel: "connect.sh" },
];

/**
 * Social links shown at the bottom of the Sidebar.
 * Placeholder hrefs — update with real profile URLs.
 */
export const SOCIAL_LINKS = [
  { key: "github", label: "GH", href: "https://github.com/your-username" },
  { key: "linkedin", label: "IN", href: "https://linkedin.com/in/your-username" },
  { key: "email", label: "MAIL", href: "mailto:you@example.com" },
];