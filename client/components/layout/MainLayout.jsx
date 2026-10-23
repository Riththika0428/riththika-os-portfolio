"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import PageTransition from "@/components/layout/PageTransition";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

export default function MainLayout({ children, settings = DEFAULT_SITE_SETTINGS }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar settings={settings} className="hidden lg:flex fixed inset-y-0 left-0" />
      <MobileNav settings={settings} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}