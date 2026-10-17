"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { formatMonth, isExpired } from "@/lib/dates";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import RowControls from "@/components/admin/forms/RowControls";
import CertificationModal from "@/components/admin/certifications/CertificationModal";

const editBtn =
  "inline-flex size-7 items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800";

export default function AdminCertificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [modal, setModal] = useState(null); // { item: certification | null }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    adminFetch("/certifications").then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setError(error || "No data returned");
      } else {
        setItems((data.certifications ?? []).filter(Boolean));
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
    if (target < 0 || target >= items.length) return;
    const previous = items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next); // optimistic

    const { error } = await adminFetch("/certifications/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids: next.map((x) => x._id) }),
    });
    if (error) {
      setItems(previous);
      toast.error(error);
    }
  }

  function handleSaved(item, isNew) {
    setItems((list) => (isNew ? [...list, item] : list.map((x) => (x._id === item._id ? item : x))));
    toast.success(`Certification ${isNew ? "added" : "updated"} successfully.`);
    setModal(null);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target?._id) return;
    setDeleting(true);
    const { error } = await adminFetch(`/certifications/${target._id}`, { method: "DELETE" });
    setDeleting(false);
    if (error) return toast.error(error);
    setItems((list) => list.filter((x) => x._id !== target._id));
    toast.success(`"${target.title}" deleted.`);
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Certifications</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? "Loading…"
              : `${items.length} ${items.length === 1 ? "certification" : "certifications"} on the public Education page`}
          </p>
        </div>
        <button onClick={() => setModal({ item: null })} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="size-4" /> Add certification
        </button>
      </div>

      {loading ? (
        <ul className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
          ))}
        </ul>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>Couldn&apos;t load certifications: {error}</p>
          <button onClick={retry} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-16 text-center">
          <p className="text-slate-300">No certifications yet.</p>
          <p className="text-sm text-slate-500">The Certifications section stays hidden on the site until you add one.</p>
          <button onClick={() => setModal({ item: null })} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">Add your first certification</button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c, i) => (
            <li key={c._id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-slate-100">{c.title}</h2>
                  {isExpired(c.expiryDate) && (
                    <span className="rounded bg-slate-700/60 px-2 py-0.5 text-[11px] text-slate-300">Expired</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {c.issuer}
                  <span className="text-slate-500">
                    {" "}· Issued {formatMonth(c.issueDate)}
                    {c.expiryDate ? ` · Expires ${formatMonth(c.expiryDate)}` : " · No expiry"}
                  </span>
                </p>
                {c.credentialId && <p className="mt-1 font-mono text-xs text-slate-500">ID: {c.credentialId}</p>}
                {c.description && <p className="mt-2 line-clamp-2 text-sm text-slate-400">{c.description}</p>}
                {(c.skills ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.skills.map((s) => (
                      <span key={s} className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[11px] text-slate-300">{s}</span>
                    ))}
                  </div>
                )}
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-300 hover:underline">
                    <ExternalLink className="size-3" /> Credential link
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => setModal({ item: c })} aria-label={`Edit ${c.title}`} className={editBtn}>
                  <Pencil className="size-4" />
                </button>
                <RowControls index={i} count={items.length} label={c.title} onMove={move} onRemove={() => setDeleteTarget(c)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <CertificationModal
          key={modal.item?._id ?? "new"}
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete certification?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.` : ""}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}