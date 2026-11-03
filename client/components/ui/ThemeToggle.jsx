"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme } from "@/lib/theme";

// `floating` sits above the bottom-right corner, clear of the admin save bars (admin pages have no top bar of our own).
export default function ThemeToggle({ floating = false, className = "" }) {
  const [theme, setTheme] = useState(null); // null until mounted, so server and client markup match

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : readTheme());
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  const isLight = theme === "light";
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center size-9 shrink-0 rounded-control border border-border bg-card text-text-body hover:text-text-heading hover:border-purple/60 transition-colors",
        floating ? "fixed bottom-20 right-4 z-40 shadow-card" : "",
        className,
      ].join(" ").trim()}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}