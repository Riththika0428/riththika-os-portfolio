"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import GithubIcon from "@/components/ui/icons/GithubIcon";
import LinkedinIcon from "@/components/ui/icons/LinkedinIcon";
import { ROUTES, SOCIAL_LINKS, SITE } from "@/lib/constants/site";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";

// Real brand logos for the socials that have one; Mail is a generic
// lucide icon since email isn't a "brand".
const SOCIAL_ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  email: Mail,
};

export default function Sidebar({ className }) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "bg-surface w-[260px] shrink-0 flex flex-col justify-between p-4",
        className
      )}
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Brand */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-cyan text-lg leading-none">⌁</span>
            <span className="text-text-bright text-sm tracking-tight">{SITE.name}</span>
          </div>
          <StatusBadge label="Online" color="mint" />
        </div>

        {/* Profile */}
        <div className="bg-elevated rounded-panel flex flex-col items-center gap-2 p-4 w-full">
          <div className="relative">
            <Avatar src={SITE.avatar} name={SITE.author} size={64} className="text-xl" />
            <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-elevated flex items-center justify-center">
              <span className="size-2.5 rounded-full bg-mint" />
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-text-heading text-lg font-semibold leading-[26px]">
              {SITE.author}
            </span>
            <span className="text-text-body text-[13px] leading-5">Full Stack Developer</span>
          </div>
          <span className="bg-chip2 text-text-body text-[11px] tracking-[0.66px] px-2 py-1 rounded-chip">
            BIT Undergraduate
          </span>
          <div className="bg-chip flex items-center justify-center gap-1 px-2 py-1 rounded-control w-full">
            <span className="size-1.5 rounded-full bg-mint" />
            <span className="text-mint-pale text-[11px] tracking-tight text-center">
              Available for opportunities
            </span>
          </div>
        </div>

        {/* Nav — active item gets a left accent bar + a shell-style caret */}
        <nav className="relative flex flex-col gap-1 w-full">
          {ROUTES.map((route) => {
            const active = pathname === route.path;

            return (
              <Link
                key={route.key}
                href={route.path}
                className={clsx(
                  "relative flex items-center justify-between pl-3 pr-2 py-1 rounded-control overflow-hidden",
                  active ? "text-text-bright" : "text-text-body hover:bg-elevated transition-colors"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-subtle shadow-glow-cyan rounded-control"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1 bottom-1 w-0.5 bg-cyan shadow-glow-cyan rounded-full"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={clsx(
                      "font-mono text-xs w-3 shrink-0",
                      active ? "text-cyan" : "text-transparent"
                    )}
                  >
                    {active ? ">" : ""}
                  </span>
                  <span className="text-[13px] leading-5">{route.label}</span>
                </span>
                <span className="relative z-10 text-text-muted text-[11px] tracking-[0.66px]">
                  {route.fileLabel}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Social + system footer — real brand icons */}
      <div className="flex flex-col gap-2 w-full pt-2">
        <div className="bg-elevated rounded-control flex items-center justify-around py-2 w-full">
          {SOCIAL_LINKS.map((social) => {
            const Icon = SOCIAL_ICONS[social.key];
            return (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-text-body hover:text-text-bright transition-colors"
                aria-label={social.key}
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-[11px] tracking-[0.66px]">System v2.4.0</span>
            <span className="text-mint text-[11px] tracking-[0.66px]">● 14ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
}