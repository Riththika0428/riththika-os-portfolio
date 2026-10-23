"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Layout, Server, Code2, Database, Wrench, Sparkles } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import RowControls from "@/components/admin/forms/RowControls";
import CategoryModal from "@/components/admin/skills/CategoryModal";

const ICONS = { Layout, Server, Code2, Database, Wrench, Sparkles };
const editBtn =
  "inline-flex size-7 items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800";

function SectionHeader({ title, count, onAdd, addLabel }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-400">{count} total</p>
      </div>
      <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center text-sm text-slate-400">{text}</div>;
}

export default function AdminSkillsPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    adminFetch("/skills").then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setError(error || "No data returned");
      } else {
        setCategories((data.categories ?? []).filter(Boolean));
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
    if (target < 0 || target >= categories.length) return;

    const previous = categories;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);

    const { error } = await adminFetch("/skills/categories/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids: next.map((x) => x._id) }),
    });
    if (error) {
      setCategories(previous);
      toast.error(error);
    }
  }

  function handleSaved(item, isNew) {
    setCategories((list) => (isNew ? [...list, item] : list.map((x) => (x._id === item._id ? item : x))));
    toast.success(`Category ${isNew ? "added" : "updated"} successfully.`);
    setModal(null);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target?.item?._id) return;
    setDeleting(true);
    const { error } = await adminFetch(`/skills/categories/${target.item._id}`, { method: "DELETE" });
    setDeleting(false);
    if (error) return toast.error(error);

    setCategories((list) => list.filter((x) => x._id !== target.item._id));
    toast.success("Deleted.");
    setDeleteTarget(null);
  }

  const deleteName = deleteTarget ? deleteTarget.item.title : "";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Skills</h1>
        <p className="mt-1 text-sm text-slate-400">Everything on the public Skills page. Changes show on the site straight away.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>Couldn&apos;t load skills: {error}</p>
          <button onClick={retry} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Skill categories" count={categories.length} addLabel="Add category" onAdd={() => setModal({ type: "category", item: null })} />
          {categories.length === 0 ? (
            <Empty text="No categories yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {categories.map((c, i) => {
                const Icon = ICONS[c.icon];
                return (
                  <li key={c._id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-800 text-cyan-400">
                        {Icon && <Icon className="size-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-slate-100">{c.title}</h3>
                          {c.highlight && <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[11px] text-purple-300">In Progress</span>}
                        </div>
                        {(c.skills ?? []).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {c.skills.map((s) => (
                              <span key={s} className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[11px] text-slate-300">{s}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">No skills yet.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => setModal({ type: "category", item: c })} aria-label={`Edit ${c.title}`} className={editBtn}>
                        <Pencil className="size-4" />
                      </button>
                      <RowControls index={i} count={categories.length} label={c.title} onMove={move} onRemove={() => setDeleteTarget({ item: c })} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {modal?.type === "category" && (
        <CategoryModal key={modal.item?._id ?? "new"} item={modal.item} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this item?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteName}"? This cannot be undone.` : ""}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}