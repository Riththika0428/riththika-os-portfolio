"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import Field, { inputCls } from "@/components/admin/forms/Field";
import TagInput from "@/components/admin/forms/TagInput";
import RowControls from "@/components/admin/forms/RowControls";

const EMPTY = { introParagraphs: [""], profileFields: [], journey: [] };

/* ---- helpers: the form works on rows that carry a local `uid` (never sent to the server) ---- */
let counter = 0;
const uid = () => `r${++counter}`;
const toForm = (d) => ({
  introParagraphs: (d?.introParagraphs?.length ? d.introParagraphs : [""]).map((text) => ({ uid: uid(), text })),
  profileFields: (d?.profileFields ?? []).map((f) => ({ uid: uid(), label: f.label ?? "", value: f.value ?? "" })),
  journey: (d?.journey ?? []).map((j) => ({
    uid: uid(), year: j.year ?? "", title: j.title ?? "", description: j.description ?? "",
    tags: j.tags ?? [], now: Boolean(j.now),
  })),
});
const toPayload = (f) => ({
  introParagraphs: f.introParagraphs.map((p) => p.text.trim()),
  profileFields: f.profileFields.map((x) => ({ label: x.label.trim(), value: x.value.trim() })),
  journey: f.journey.map((j) => ({
    year: j.year.trim(), title: j.title.trim(), description: j.description.trim(), tags: j.tags, now: j.now,
  })),
});

function validate(p) {
  const errors = [];
  if (p.introParagraphs.length === 0 || p.introParagraphs.some((t) => !t)) errors.push("Intro paragraphs can't be empty. Fill in or remove the blank ones.");
  if (p.profileFields.some((x) => !x.label || !x.value)) errors.push("Every profile field needs a label and a value.");
  if (p.journey.some((j) => !j.year || !j.title)) errors.push("Every journey entry needs a year/label and a title.");
  return errors;
}

function move(list, index, dir) {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const card = "rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4";
const addBtn = "inline-flex items-center gap-2 self-start rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800";

export default function AdminAboutPage() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [fresh, setFresh] = useState(false); // nothing saved in the database yet
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [problems, setProblems] = useState([]);
  const [serverError, setServerError] = useState("");
  const loaded = useRef(null);

  useEffect(() => {
    let active = true;
    adminFetch("/about").then(({ data, error, status }) => {
      if (!active) return;
      if (error && status !== 404) {
        setLoadError(error);
        return;
      }
      const source = error ? EMPTY : data; // 404 = not seeded yet: start from a blank form
      const f = toForm(source);
      loaded.current = source;
      setForm(f);
      setBaseline(JSON.stringify(toPayload(f)));
      setFresh(Boolean(error));
      setLoadError("");
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  const dirty = useMemo(() => form !== null && JSON.stringify(toPayload(form)) !== baseline, [form, baseline]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (key, fn) => setForm((f) => ({ ...f, [key]: fn(f[key]) }));
  const patchRow = (key, uidValue, patch) =>
    update(key, (list) => list.map((r) => (r.uid === uidValue ? { ...r, ...patch } : r)));

  async function save() {
    setServerError("");
    const payload = toPayload(form);
    const found = validate(payload);
    setProblems(found);
    if (found.length) return;

    setSaving(true);
    const { data, error } = await adminFetch("/about", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (error || !data) return setServerError(error || "The server didn't return the saved content.");

    const f = toForm(data);
    loaded.current = data;
    setForm(f);
    setBaseline(JSON.stringify(toPayload(f)));
    setFresh(false);
    toast.success("About page saved.");
  }

  function discard() {
    const f = toForm(loaded.current);
    setForm(f);
    setProblems([]);
    setServerError("");
  }

  if (loadError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
        <p>Couldn&apos;t load About content: {loadError}</p>
        <button onClick={() => { setLoadError(""); setAttempt((a) => a + 1); }} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
      </div>
    );
  }
  if (!form) {
    return <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" aria-label="Loading About content" />;
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold">About</h1>
        <p className="mt-1 text-sm text-slate-400">Edit the intro, profile details and journey shown on the public About page.</p>
        {fresh && <p className="mt-2 text-sm text-amber-300">Nothing has been saved yet. Fill this in and press Save to create it.</p>}
      </div>

      {/* ---------- intro ---------- */}
      <section className={card} aria-labelledby="about-intro">
        <div>
          <h2 id="about-intro" className="font-medium">Intro (readme.md)</h2>
          <p className="text-xs text-slate-500">Each box is one paragraph.</p>
        </div>
        {form.introParagraphs.map((p, i) => (
          <div key={p.uid} className="flex items-start gap-2">
            <textarea
              aria-label={`Paragraph ${i + 1}`}
              rows={3}
              maxLength={1500}
              value={p.text}
              onChange={(e) => patchRow("introParagraphs", p.uid, { text: e.target.value })}
              className={inputCls}
            />
            <RowControls index={i} count={form.introParagraphs.length} label={`paragraph ${i + 1}`}
              onMove={(idx, dir) => update("introParagraphs", (l) => move(l, idx, dir))}
              onRemove={(idx) => update("introParagraphs", (l) => l.filter((_, n) => n !== idx))} />
          </div>
        ))}
        <button type="button" className={addBtn} onClick={() => update("introParagraphs", (l) => [...l, { uid: uid(), text: "" }])}>
          <Plus className="size-4" /> Add paragraph
        </button>
      </section>

      {/* ---------- profile fields ---------- */}
      <section className={card} aria-labelledby="about-profile">
        <div>
          <h2 id="about-profile" className="font-medium">Profile details (profile.json)</h2>
          <p className="text-xs text-slate-500">Label/value pairs such as Role, Education, Location.</p>
        </div>
        {form.profileFields.length === 0 && <p className="text-sm text-slate-500">No profile details yet.</p>}
        {form.profileFields.map((f, i) => (
          <div key={f.uid} className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <input aria-label={`Field ${i + 1} label`} maxLength={40} placeholder="Label" value={f.label}
                onChange={(e) => patchRow("profileFields", f.uid, { label: e.target.value })} className={inputCls} />
              <input aria-label={`Field ${i + 1} value`} maxLength={200} placeholder="Value" value={f.value}
                onChange={(e) => patchRow("profileFields", f.uid, { value: e.target.value })} className={inputCls} />
            </div>
            <RowControls index={i} count={form.profileFields.length} label={`field ${i + 1}`}
              onMove={(idx, dir) => update("profileFields", (l) => move(l, idx, dir))}
              onRemove={(idx) => update("profileFields", (l) => l.filter((_, n) => n !== idx))} />
          </div>
        ))}
        <button type="button" className={addBtn} onClick={() => update("profileFields", (l) => [...l, { uid: uid(), label: "", value: "" }])}>
          <Plus className="size-4" /> Add field
        </button>
      </section>

      {/* ---------- journey ---------- */}
      <section className={card} aria-labelledby="about-journey">
        <div>
          <h2 id="about-journey" className="font-medium">Developer journey</h2>
          <p className="text-xs text-slate-500">Shown top to bottom as the timeline. Mark at most one entry as &quot;Now&quot;.</p>
        </div>
        {form.journey.length === 0 && <p className="text-sm text-slate-500">No milestones yet.</p>}
        {form.journey.map((j, i) => (
          <div key={j.uid} className="flex items-start gap-2 rounded-lg border border-slate-800 p-3">
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr]">
                <Field label="Year / label" htmlFor={`j-year-${j.uid}`}>
                  <input id={`j-year-${j.uid}`} maxLength={20} placeholder="2026" value={j.year}
                    onChange={(e) => patchRow("journey", j.uid, { year: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Title" htmlFor={`j-title-${j.uid}`}>
                  <input id={`j-title-${j.uid}`} maxLength={120} value={j.title}
                    onChange={(e) => patchRow("journey", j.uid, { title: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Description" htmlFor={`j-desc-${j.uid}`}>
                <textarea id={`j-desc-${j.uid}`} rows={2} maxLength={600} value={j.description}
                  onChange={(e) => patchRow("journey", j.uid, { description: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Tags" htmlFor={`j-tags-${j.uid}`}>
                <TagInput id={`j-tags-${j.uid}`} value={j.tags} onChange={(tags) => patchRow("journey", j.uid, { tags })} placeholder="React, Node.js…" />
              </Field>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" aria-label={`Milestone ${i + 1} is current`} checked={j.now}
                  onChange={(e) => update("journey", (l) => l.map((r) => ({ ...r, now: r.uid === j.uid ? e.target.checked : false })))} />
                This is what I&apos;m doing now
              </label>
            </div>
            <RowControls index={i} count={form.journey.length} label={`milestone ${i + 1}`}
              onMove={(idx, dir) => update("journey", (l) => move(l, idx, dir))}
              onRemove={(idx) => update("journey", (l) => l.filter((_, n) => n !== idx))} />
          </div>
        ))}
        <button type="button" className={addBtn} onClick={() => update("journey", (l) => [...l, { uid: uid(), year: "", title: "", description: "", tags: [], now: false }])}>
          <Plus className="size-4" /> Add milestone
        </button>
      </section>

      {/* ---------- save bar ---------- */}
      <div className="sticky bottom-0 -mx-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/95 p-3 backdrop-blur">
        {problems.length > 0 && (
          <ul role="alert" className="list-disc pl-5 text-sm text-red-300">
            {problems.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}
        {serverError && <p role="alert" className="text-sm text-red-300">{serverError}</p>}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-400">{dirty ? "You have unsaved changes." : "All changes saved."}</span>
          <div className="flex gap-2">
            <button type="button" onClick={discard} disabled={!dirty || saving} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50">Discard</button>
            <button type="button" onClick={save} disabled={(!dirty && !fresh) || saving} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}