"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import Field, { inputCls } from "@/components/admin/forms/Field";
import TagInput from "@/components/admin/forms/TagInput";
import RowControls from "@/components/admin/forms/RowControls";

/* ---- the form works on rows that carry a local `uid` (never sent to the server) ---- */
let counter = 0;
const uid = () => `r${++counter}`;

const toForm = (d) => ({
  headline: d?.headline ?? "",
  contact: {
    location: d?.contact?.location ?? "",
    availability: d?.contact?.availability ?? "",
    email: d?.contact?.email ?? "",
    github: d?.contact?.github ?? "",
    linkedin: d?.contact?.linkedin ?? "",
  },
  summary: d?.summary ?? "",
  skillGroups: (d?.skillGroups ?? []).map((g) => ({ uid: uid(), label: g.label ?? "", items: g.items ?? [] })),
  experience: d?.experience ?? "",
  achievements: (d?.achievements ?? []).map((a) => ({ uid: uid(), title: a.title ?? "", description: a.description ?? "" })),
  pdfUrl: d?.pdfUrl ?? "",
  projects: { mode: d?.projects?.mode ?? "all", slugs: d?.projects?.slugs ?? [] },
});

const toPayload = (f) => ({
  headline: f.headline.trim(),
  contact: Object.fromEntries(Object.entries(f.contact).map(([k, v]) => [k, v.trim()])),
  summary: f.summary.trim(),
  skillGroups: f.skillGroups.map((g) => ({ label: g.label.trim(), items: g.items })),
  experience: f.experience.trim(),
  achievements: f.achievements.map((a) => ({ title: a.title.trim(), description: a.description.trim() })),
  pdfUrl: f.pdfUrl.trim(),
  projects: { mode: f.projects.mode, slugs: f.projects.mode === "selected" ? f.projects.slugs : [] },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate(p) {
  const errors = [];
  if (p.contact.email && !EMAIL_RE.test(p.contact.email)) errors.push("Email address doesn't look valid.");
  if (/\s/.test(p.contact.github) || /\s/.test(p.contact.linkedin)) errors.push("GitHub and LinkedIn can't contain spaces.");
  if (p.pdfUrl && !(/^\/(?!\/)\S*$/.test(p.pdfUrl) || /^https?:\/\/\S+$/i.test(p.pdfUrl))) {
    errors.push("Resume PDF must be a path like /resume.pdf or a full https:// link.");
  }
  if (p.skillGroups.some((g) => !g.label)) errors.push("Every skill group needs a name.");
  if (p.achievements.some((a) => !a.title)) errors.push("Every achievement needs a title.");
  if (p.projects.mode === "selected" && p.projects.slugs.length === 0) errors.push("Choose at least one project, or switch to “All projects”.");
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

export default function AdminResumePage() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [projectList, setProjectList] = useState(null); // null = loading, [] = none, false = failed
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [problems, setProblems] = useState([]);
  const [serverError, setServerError] = useState("");
  const loaded = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([adminFetch("/resume"), adminFetch("/projects")]).then(([resume, projects]) => {
      if (!active) return;
      if (resume.error || !resume.data) {
        setLoadError(resume.error || "No data returned");
        return;
      }
      const f = toForm(resume.data);
      loaded.current = resume.data;
      setForm(f);
      setBaseline(JSON.stringify(toPayload(f)));
      setIsDefault(Boolean(resume.data.isDefault));
      setProjectList(projects.error || !projects.data ? false : (projects.data.projects ?? []).filter(Boolean));
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

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setContact = (key) => (e) => setForm((f) => ({ ...f, contact: { ...f.contact, [key]: e.target.value } }));
  const update = (key, fn) => setForm((f) => ({ ...f, [key]: fn(f[key]) }));
  const patchRow = (key, uidValue, patch) => update(key, (list) => list.map((r) => (r.uid === uidValue ? { ...r, ...patch } : r)));

  async function save() {
    setServerError("");
    const payload = toPayload(form);
    const found = validate(payload);
    setProblems(found);
    if (found.length) return;

    setSaving(true);
    const { data, error } = await adminFetch("/resume", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (error || !data) return setServerError(error || "The server didn't return the saved resume.");

    const f = toForm(data);
    loaded.current = data;
    setForm(f);
    setBaseline(JSON.stringify(toPayload(f)));
    setIsDefault(false);
    toast.success("Resume saved.");
  }

  function discard() {
    setForm(toForm(loaded.current));
    setProblems([]);
    setServerError("");
  }

  function toggleSlug(slug, checked) {
    setForm((f) => {
      const set = new Set(f.projects.slugs);
      if (checked) set.add(slug);
      else set.delete(slug);
      return { ...f, projects: { ...f.projects, slugs: [...set] } };
    });
  }

  if (loadError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
        <p>Couldn&apos;t load Resume content: {loadError}</p>
        <button onClick={() => { setLoadError(""); setAttempt((a) => a + 1); }} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
      </div>
    );
  }
  if (!form) {
    return <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" aria-label="Loading Resume content" />;
  }

  const known = Array.isArray(projectList) ? projectList : [];
  const missingSlugs = form.projects.slugs.filter((s) => Array.isArray(projectList) && !known.some((p) => p.slug === s));
  const effectivePdf = form.pdfUrl.trim() || "/resume.pdf";

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold">Resume</h1>
        <p className="mt-1 text-sm text-slate-400">
          Edit what appears on the public Resume page. Education and Projects are taken from their own admin sections.
        </p>
        {isDefault && <p className="mt-2 text-sm text-amber-300">Showing the default content. Nothing has been saved yet. Press Save to store it.</p>}
      </div>

      {/* ---------- header & contact ---------- */}
      <section className={card} aria-labelledby="resume-header">
        <h2 id="resume-header" className="font-medium">Header &amp; contact</h2>
        <Field label="Headline" htmlFor="resume-headline" hint="Shown next to your name, e.g. “Full Stack Developer | BIT Undergraduate”.">
          <input id="resume-headline" maxLength={120} value={form.headline} onChange={(e) => setField("headline", e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Location" htmlFor="resume-location">
            <input id="resume-location" maxLength={80} value={form.contact.location} onChange={setContact("location")} className={inputCls} />
          </Field>
          <Field label="Availability" htmlFor="resume-availability">
            <input id="resume-availability" maxLength={80} value={form.contact.availability} onChange={setContact("availability")} className={inputCls} />
          </Field>
          <Field label="Email" htmlFor="resume-email" hint="Optional. Hidden on the resume when empty.">
            <input id="resume-email" type="email" maxLength={254} value={form.contact.email} onChange={setContact("email")} className={inputCls} />
          </Field>
          <Field label="GitHub" htmlFor="resume-github" hint="e.g. github.com/your-handle. Hidden when empty.">
            <input id="resume-github" maxLength={100} value={form.contact.github} onChange={setContact("github")} className={inputCls} />
          </Field>
          <Field label="LinkedIn" htmlFor="resume-linkedin" hint="e.g. linkedin.com/in/your-handle. Hidden when empty.">
            <input id="resume-linkedin" maxLength={100} value={form.contact.linkedin} onChange={setContact("linkedin")} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* ---------- summary ---------- */}
      <section className={card} aria-labelledby="resume-summary-h">
        <h2 id="resume-summary-h" className="font-medium">Professional summary</h2>
        <textarea aria-label="Professional summary" rows={5} maxLength={1500} value={form.summary} onChange={(e) => setField("summary", e.target.value)} className={inputCls} />
        <p className="text-xs text-slate-500">{form.summary.length}/1500</p>
      </section>

      {/* ---------- skills ---------- */}
      <section className={card} aria-labelledby="resume-skills-h">
        <div>
          <h2 id="resume-skills-h" className="font-medium">Technical skills</h2>
          <p className="text-xs text-slate-500">Groups shown as a comma-separated list on the resume. Separate from the Skills page.</p>
        </div>
        {form.skillGroups.length === 0 && <p className="text-sm text-slate-500">No skill groups yet.</p>}
        {form.skillGroups.map((g, i) => (
          <div key={g.uid} className="flex items-start gap-2 rounded-lg border border-slate-800 p-3">
            <div className="flex flex-1 flex-col gap-3">
              <Field label="Group name" htmlFor={`sg-label-${g.uid}`}>
                <input id={`sg-label-${g.uid}`} maxLength={60} value={g.label} onChange={(e) => patchRow("skillGroups", g.uid, { label: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Skills" htmlFor={`sg-items-${g.uid}`} hint="Press Enter or comma to add.">
                <TagInput id={`sg-items-${g.uid}`} value={g.items} onChange={(items) => patchRow("skillGroups", g.uid, { items })} placeholder="React, Node.js…" />
              </Field>
            </div>
            <RowControls index={i} count={form.skillGroups.length} label={`group ${i + 1}`}
              onMove={(idx, dir) => update("skillGroups", (l) => move(l, idx, dir))}
              onRemove={(idx) => update("skillGroups", (l) => l.filter((_, n) => n !== idx))} />
          </div>
        ))}
        <button type="button" className={addBtn} onClick={() => update("skillGroups", (l) => [...l, { uid: uid(), label: "", items: [] }])}>
          <Plus className="size-4" /> Add skill group
        </button>
      </section>

      {/* ---------- experience ---------- */}
      <section className={card} aria-labelledby="resume-exp-h">
        <h2 id="resume-exp-h" className="font-medium">Experience / learning</h2>
        <textarea aria-label="Experience / learning" rows={4} maxLength={2000} value={form.experience} onChange={(e) => setField("experience", e.target.value)} className={inputCls} />
      </section>

      {/* ---------- achievements ---------- */}
      <section className={card} aria-labelledby="resume-ach-h">
        <div>
          <h2 id="resume-ach-h" className="font-medium">Achievements</h2>
          <p className="text-xs text-slate-500">Only add real recognitions. While empty, the resume shows “No achievements added yet.”</p>
        </div>
        {form.achievements.map((a, i) => (
          <div key={a.uid} className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <input aria-label={`Achievement ${i + 1} title`} maxLength={120} placeholder="Title" value={a.title} onChange={(e) => patchRow("achievements", a.uid, { title: e.target.value })} className={inputCls} />
              <input aria-label={`Achievement ${i + 1} description`} maxLength={300} placeholder="Description (optional)" value={a.description} onChange={(e) => patchRow("achievements", a.uid, { description: e.target.value })} className={inputCls} />
            </div>
            <RowControls index={i} count={form.achievements.length} label={`achievement ${i + 1}`}
              onMove={(idx, dir) => update("achievements", (l) => move(l, idx, dir))}
              onRemove={(idx) => update("achievements", (l) => l.filter((_, n) => n !== idx))} />
          </div>
        ))}
        <button type="button" className={addBtn} onClick={() => update("achievements", (l) => [...l, { uid: uid(), title: "", description: "" }])}>
          <Plus className="size-4" /> Add achievement
        </button>
      </section>

      {/* ---------- projects ---------- */}
      <section className={card} aria-labelledby="resume-proj-h">
        <div>
          <h2 id="resume-proj-h" className="font-medium">Projects on the resume</h2>
          <p className="text-xs text-slate-500">Projects appear in the same order as the Projects page.</p>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Which projects to show</legend>
          <label className="inline-flex items-center gap-2 text-sm text-slate-200">
            <input type="radio" name="project-mode" checked={form.projects.mode === "all"} onChange={() => setField("projects", { ...form.projects, mode: "all" })} />
            All projects
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-200">
            <input type="radio" name="project-mode" checked={form.projects.mode === "selected"} onChange={() => setField("projects", { ...form.projects, mode: "selected" })} />
            Choose projects
          </label>
        </fieldset>
        {form.projects.mode === "selected" && (
          projectList === false ? (
            <p role="alert" className="text-sm text-red-300">Couldn&apos;t load your projects, so the list can&apos;t be shown. Your current selection is kept.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {known.map((p) => (
                <li key={p.slug}>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                    <input type="checkbox" checked={form.projects.slugs.includes(p.slug)} onChange={(e) => toggleSlug(p.slug, e.target.checked)} aria-label={p.title} />
                    {p.title}
                  </label>
                </li>
              ))}
              {missingSlugs.map((s) => (
                <li key={s}>
                  <label className="inline-flex items-center gap-2 text-sm text-amber-300">
                    <input type="checkbox" checked onChange={(e) => toggleSlug(s, e.target.checked)} aria-label={`${s} (project not found)`} />
                    {s} — project not found, will be ignored
                  </label>
                </li>
              ))}
              {known.length === 0 && missingSlugs.length === 0 && <li className="text-sm text-slate-500">You have no projects yet.</li>}
            </ul>
          )
        )}
      </section>

      {/* ---------- pdf ---------- */}
      <section className={card} aria-labelledby="resume-pdf-h">
        <h2 id="resume-pdf-h" className="font-medium">Resume PDF</h2>
        <Field label="PDF link" htmlFor="resume-pdf" hint="Leave empty to use the file in your site's public folder (/resume.pdf), or paste a direct link to a hosted PDF.">
          <input id="resume-pdf" maxLength={500} placeholder="/resume.pdf" value={form.pdfUrl} onChange={(e) => setField("pdfUrl", e.target.value)} className={inputCls} />
        </Field>
        <p className="text-xs text-slate-500">
          The Download and Open buttons currently point to <a className="text-indigo-300 hover:underline" href={effectivePdf} target="_blank" rel="noreferrer">{effectivePdf}</a>.
        </p>
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
          <span className="text-sm text-slate-400">{isDefault ? "Defaults shown. Not saved yet." : dirty ? "You have unsaved changes." : "All changes saved."}</span>
          <div className="flex gap-2">
            <button type="button" onClick={discard} disabled={!dirty || saving} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50">Discard</button>
            <button type="button" onClick={save} disabled={(!dirty && !isDefault) || saving} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}