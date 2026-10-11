"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminGuard";
import { adminFetch } from "@/lib/adminApi";
import { ADMIN_NAV } from "@/components/admin/adminNav";

function NavLinks({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-indigo-600/20 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdmin();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleLogout() {
    await adminFetch("/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-800 bg-slate-900/60 lg:flex">
        <div className="px-5 py-5 text-sm font-semibold tracking-widest">RITHTHIKA ADMIN</div>
        <NavLinks pathname={pathname} />
      </aside>

      {/* Mobile / tablet drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-semibold tracking-widest">RITHTHIKA ADMIN</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded p-1 text-slate-400 hover:bg-slate-800">
                <X className="size-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded p-1.5 text-slate-300 hover:bg-slate-800 lg:hidden">
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold tracking-widest lg:hidden">RITHTHIKA ADMIN</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-400 md:inline">{admin?.email}</span>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="hidden rounded px-2 py-1 text-slate-300 hover:bg-slate-800 sm:inline">
              View site
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 hover:bg-slate-700">
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}