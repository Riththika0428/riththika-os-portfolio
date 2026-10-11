"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Star, Pencil, Trash2, ExternalLink } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const iconBtn =
  "inline-flex size-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800";

function ProjectRow({ project, statuses, onPatch, onDelete }) {
  return (
    <li className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-medium text-slate-100">{project.title}</h2>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">{project.category}</span>
          {project.year && <span className="text-xs text-slate-500">{project.year}</span>}
        </div>
        <p className="mt-0.5 truncate font-mono text-xs text-slate-500">/projects/{project.slug}</p>
        {(project.stack ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 5).map((t) => (
              <span key={t} className="rounded bg-slate-800/70 px-1.5 py-0.5 text-[11px] text-slate-400">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`Status of ${project.title}`}
          value={project.status ?? ""}
          onChange={(e) => e.target.value && onPatch(project, { status: e.target.value }, "Status updated.")}
          className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm text-slate-200"
        >
          {!project.status && <option value="">Set status…</option>}
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          type="button"
          aria-pressed={Boolean(project.featured)}
          aria-label={project.featured ? "Remove from featured" : "Mark as featured"}
          title={project.featured ? "Featured" : "Mark as featured"}
          onClick={() =>
            onPatch(
              project,
              { featured: !project.featured },
              project.featured ? "Removed from featured." : "Marked as featured."
            )
          }
          className={`${iconBtn} ${project.featured ? "border-amber-500/60 text-amber-400" : ""}`}
        >
          <Star className="size-4" fill={project.featured ? "currentColor" : "none"} />
        </button>

        <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View on site" title="View on site" className={iconBtn}>
          <ExternalLink className="size-4" />
        </a>
        <Link href={`/admin/projects/${project._id}/edit`} aria-label="Edit" title="Edit" className={iconBtn}>
          <Pencil className="size-4" />
        </Link>
        <button type="button" onClick={() => onDelete(project)} aria-label="Delete" title="Delete" className={`${iconBtn} hover:border-red-800 hover:text-red-400`}>
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

export default function AdminProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    adminFetch("/projects").then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setError(error || "No data returned");
      } else {
        setProjects((data.projects ?? []).filter(Boolean));
        setCategories(data.categories);
        setStatuses(data.statuses ?? []);
        setError("");
      }
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.stack ?? []).some((t) => t.toLowerCase().includes(q)))
    );
  }, [projects, query, category]);

  // Optimistic update with rollback if the API refuses.
  async function patchProject(project, changes, successMessage) {
  if (!project?._id) return;
  const previous = projects;
  setProjects((list) =>
    list.map((p) => (p?._id === project._id ? { ...p, ...changes } : p))
  );

  const { data, error } = await adminFetch(`/projects/${project._id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

  if (error || !data?.project) {
    setProjects(previous);
    toast.error(error || "The server didn't return the updated project.");
    return;
  }

  const updated = data.project;
  setProjects((list) => list.map((p) => (p?._id === updated._id ? updated : p)));
  toast.success(successMessage);
}

  async function confirmDelete() {
  const target = deleteTarget; // capture now; state changes below
  if (!target?._id) return;

  setDeleting(true);
  const { error } = await adminFetch(`/projects/${target._id}`, { method: "DELETE" });
  setDeleting(false);

  if (error) {
    toast.error(error);
    return;
  }
  setProjects((list) => list.filter((p) => p && p._id !== target._id));
  toast.success(`"${target.title}" deleted.`);
  setDeleteTarget(null);
}
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? "Loading…" : `Showing ${visible.length} of ${projects.length}`}
          </p>
        </div>
        <Link href="/admin/projects/new" className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="size-4" /> Add project
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug or technology…"
            className="w-full rounded-md border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
        </label>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
          ))}
        </ul>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>Couldn&apos;t load projects: {error}</p>
          <button onClick={retry} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-16 text-center">
          <p className="text-slate-300">No projects yet.</p>
          <Link href="/admin/projects/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">Add your first project</Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-12 text-center">
          <p className="text-slate-300">No projects match your filters.</p>
          <button onClick={() => { setQuery(""); setCategory("All"); }} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">Clear filters</button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((p) => (
            <ProjectRow key={p._id} project={p} statuses={statuses} onPatch={patchProject} onDelete={setDeleteTarget} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.` : ""}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}