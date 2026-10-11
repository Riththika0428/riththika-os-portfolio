"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { dateRange } from "@/lib/dates";
import { STATUS_DOT } from "@/lib/educationOptions";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import RowControls from "@/components/admin/forms/RowControls";
import EducationModal from "@/components/admin/education/EducationModal";

const editBtn =
  "inline-flex size-7 items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800";

export default function AdminEducationPage() {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [modal, setModal] = useState(null); // { item: entry | null }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    adminFetch("/education").then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setError(error || "No data returned");
      } else {
        setEntries((data.entries ?? []).filter(Boolean));
        setError("");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setAttempt((a) => a + 1);
  };

  async function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= entries.length) return;
    const previous = entries;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next); // optimistic

    const { error } = await adminFetch("/education/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids: next.map((x) => x._id) }),
    });
    if (error) {
      setEntries(previous);
      toast.error(error);
    }
  }

  function handleSaved(entry, isNew) {
    setEntries((list) => (isNew ? [...list, entry] : list.map((x) => (x._id === entry._id ? entry : x))));
    toast.success(`Entry ${isNew ? "added" : "updated"} successfully.`);
    setModal(null);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target?._id) return;
    setDeleting(true);
    const { error } = await adminFetch(`/education/${target._id}`, { method: "DELETE" });
    setDeleting(false);
    if (error) return toast.error(error);
    setEntries((list) => list.filter((x) => x._id !== target._id));
    toast.success(`"${target.degree}" deleted.`);
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Education</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? "Loading…" : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} on the public Education page`}
          </p>
        </div>
        <button onClick={() => setModal({ item: null })} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="size-4" /> Add entry
        </button>
      </div>

      {loading ? (
        <ul className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <li key={i} className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
          ))}
        </ul>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>Couldn&apos;t load education: {error}</p>
          <button onClick={retry} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-16 text-center">
          <p className="text-slate-300">No education entries yet.</p>
          <button onClick={() => setModal({ item: null })} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">Add your first entry</button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e, i) => {
            const range = dateRange(e);
            return (
              <li key={e._id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.tag && <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] text-cyan-300">{e.tag}</span>}
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                      <span className={`size-2 rounded-full ${STATUS_DOT[e.statusColor] ?? "bg-slate-500"}`} aria-hidden="true" />
                      {e.status}
                    </span>
                  </div>
                  <h2 className="mt-2 font-medium text-slate-100">{e.degree}</h2>
                  <p className="text-sm text-slate-400">
                    {e.institution}
                    {range && <span className="text-slate-500"> · {range}</span>}
                  </p>
                  {e.description && <p className="mt-2 line-clamp-2 text-sm text-slate-400">{e.description}</p>}
                  {(e.subjects ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.subjects.map((s) => (
                        <span key={s} className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[11px] text-slate-300">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => setModal({ item: e })} aria-label={`Edit ${e.degree}`} className={editBtn}>
                    <Pencil className="size-4" />
                  </button>
                  <RowControls index={i} count={entries.length} label={e.degree} onMove={move} onRemove={() => setDeleteTarget(e)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modal && (
        <EducationModal
          key={modal.item?._id ?? "new"}
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete education entry?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.degree}"? This cannot be undone.` : ""}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}