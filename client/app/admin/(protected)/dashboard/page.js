"use client";

import { useEffect, useState } from "react";
import { Folder, Wrench, GraduationCap, Mail } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import StatCard from "@/components/admin/StatCard";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    adminFetch("/admin/stats").then(({ data, error }) => {
      if (!active) return;
      setStats(data);
      setError(error || "");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setLoading(true);
    setAttempt((a) => a + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Overview of your portfolio content.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
          ))}
        </div>
      ) : error || !stats ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>Couldn&apos;t load statistics: {error || "no data returned"}</p>
          <button onClick={retry} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Projects" value={stats.projects} icon={Folder} href="/admin/projects" />
          <StatCard label="Total Skills" value={stats.skills} icon={Wrench} href="/admin/skills" />
          <StatCard label="Education Entries" value={stats.education} icon={GraduationCap} href="/admin/education" />
          <StatCard label="Unread Messages" value={stats.unreadMessages} icon={Mail} href="/admin/messages" highlight={stats.unreadMessages > 0} />
        </div>
      )}
    </div>
  );
}