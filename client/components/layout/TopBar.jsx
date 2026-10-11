"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ROUTES, SITE } from "@/lib/constants/site";
import StatusBadge from "@/components/ui/StatusBadge";

function currentLabel(pathname) {
  const match = ROUTES.find((r) => r.path === pathname);
  return match ? match.label.toLowerCase().replace(/\s+/g, "-") : pathname.slice(1);
}

export default function TopBar({ onMenuClick }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-14 bg-surface/80 backdrop-blur-md shadow-banner flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-control text-text-body hover:bg-elevated transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>
        <span className="text-text-body text-[13px] tracking-tight font-mono">
          <span className="text-cyan">{SITE.name.toLowerCase().replace(/\s+/g, "_")}</span>
          <span className="text-text-muted"> / </span>
          <span className="text-text-heading">{currentLabel(pathname)}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <kbd className="hidden sm:inline-flex bg-chip2 text-text-body text-[11px] tracking-[0.66px] px-2 py-1 rounded-chip">
          ⌘K
        </kbd>
        <StatusBadge label="Online" color="mint" />
      </div>
    </header>
  );
}