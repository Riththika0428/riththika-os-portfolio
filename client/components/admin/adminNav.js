import { LayoutDashboard, Folder, Wrench, GraduationCap, Award, User, FileText, Mail, Settings, BookOpen} from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: Folder },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/learning", label: "Learning", icon: BookOpen },
  { href: "/admin/about", label: "About", icon: User },
  { href: "/admin/resume", label: "Resume", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Contact & profile", icon: Settings },
  { href: "/admin/home", label: "Home", icon: LayoutDashboard }
];