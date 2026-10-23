"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import Field, { inputCls } from "@/components/admin/forms/Field";
import RowControls from "@/components/admin/forms/RowControls";

const card = "rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4";
const LEVELS = [
  { value: 5, label: "Confident" },
  { value: 4, label: "Comfortable" },
  { value: 3, label: "Familiar" },
  { value: 2, label: "Learning" },
  { value: 1, label: "Just Started" },
];
const MAX_TRACKS = 12;

const toForm = (d) => ({ intro: d?.intro ?? "", tracks: (d?.tracks ?? []).map((t) => ({ label: t.label ?? "", level: Number(t.level) || 3 })) });
const toPayload = (f) => ({ intro: f.intro.trim(), tracks: f.tracks.map((t) => ({ label: t.label.trim(), level: Number(t.level) })) });

export default function AdminLearningPage() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let active = true;
    adminFetch("/learning").then(({ data, error }) => {
      if (!active) return;
      if (error) return setLoadError(error);
      const f = toForm(data);
      setForm(f);
      setBaseline(JSON.stringify(toPayload(f)));
      setLoadError("");
    });
    return () => { active = false; };
  }, [attempt]);

  const dirty = useMemo(() => form !== null && JSON.stringify(toPayload(form)) !== baseline, [form, baseline]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setTracks = (tracks) => setForm((f) => ({ ...f, tracks }));
  const updateTrack = (i, key, value) => setTracks(form.tracks.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)));
  const removeTrack = (i) => setTracks(form.tracks.filter((_, idx) => idx !== i));
  const moveTrack = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= form.tracks.length) return;
    const next = [...form.tracks];
    [next[i], next[j]] = [next[j], next[i]];
    setTracks(next);
  };

  async function save() {
    setServerError("");
    const payload = toPayload(form);
    const found = {};
    if (!payload.intro) found.intro = "Intro text is required.";
    payload.tracks.forEach((t, i) => { if (!t.label) found[`${i}.label`] = "Name is required."; });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const { data, error } = await adminFetch("/learning", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (error || !data) return setServerError(error || "The server didn't return the saved content.");

    const f = toForm(data);
    setForm(f);
    setBaseline(JSON.stringify(toPayload(f)));
    toast.success("Learning section saved.");
  }

  if (loadError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
        <p>Couldn&apos;t load the learning section: {loadError}</p>
        <button onClick={() => { setLoadError(""); setAttempt((a) => a + 1); }} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
      </div>
    );
  }
  if (!form) return <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" aria-label="Loading learning section" />;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold">Learning</h1>
        <p className="mt-1 text-sm text-slate-400">The &ldquo;Continuous Learning&rdquo; box at the bottom of the public Education page.</p>
      </div>

      {serverError && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{serverError}</div>}

      <section className={card} aria-labelledby="learn-intro">
        <h2 id="learn-intro" className="text-lg font-medium">Intro</h2>
        <Field label="Intro text" htmlFor="learn-intro-text" required error={errors.intro} hint="One or two sentences about how you keep learning.">
          <textarea id="learn-intro-text" rows={3} maxLength={500} value={form.intro} onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))} className={inputCls} />
        </Field>
      </section>

      <section className={card} aria-labelledby="learn-tracks">
        <h2 id="learn-tracks" className="text-lg font-medium">Learning tracks</h2>
        <p className="text-sm text-slate-400">What you are learning right now (up to {MAX_TRACKS}). Remove them all to hide the list.</p>
        {form.tracks.length === 0 && <p className="text-sm text-slate-500">No tracks. The list is hidden on the Education page.</p>}
        {form.tracks.map((t, i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Track {i + 1}</span>
              <RowControls index={i} count={form.tracks.length} onMove={moveTrack} onRemove={removeTrack} label={`track ${i + 1}`} />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Name</span>
                <input type="text" value={t.label} maxLength={60} onChange={(e) => updateTrack(i, "label", e.target.value)} className={inputCls} aria-label={`Track ${i + 1} name`} />
                {errors[`${i}.label`] && <span role="alert" className="text-xs text-red-400">{errors[`${i}.label`]}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Level</span>
                <select value={t.level} onChange={(e) => updateTrack(i, "level", Number(e.target.value))} className={inputCls} aria-label={`Track ${i + 1} level`}>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTracks([...form.tracks, { label: "", level: 3 }])}
          disabled={form.tracks.length >= MAX_TRACKS}
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <Plus className="size-4" /> Add track
        </button>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/90 px-6 py-3 backdrop-blur">
        {dirty && <span className="mr-auto text-sm text-amber-300">You have unsaved changes.</span>}
        <button type="button" onClick={save} disabled={saving || !dirty} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}