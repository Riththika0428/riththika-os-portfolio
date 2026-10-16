"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import Field, { inputCls } from "@/components/admin/forms/Field";
import TagInput from "@/components/admin/forms/TagInput";
import StringListEditor from "@/components/admin/forms/StringListEditor";
import RowsEditor from "@/components/admin/forms/RowsEditor";
import CoverImageField from "@/components/admin/forms/CoverImageField";
import ScreenshotsField from "@/components/admin/forms/ScreenshotsField";
import {
  EMPTY_PROJECT,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  slugify,
  toFormValues,
  toPayload,
  validateProject,
} from "@/lib/projectForm";

function Section({ title, description, children }) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ProjectForm({ projectId }) {
  const isEdit = Boolean(projectId);
  const router = useRouter();
  const toast = useToast();

  const [values, setValues] = useState(EMPTY_PROJECT);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null); // { message, notFound }
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // a cover image is still uploading
  const [shotsUploading, setShotsUploading] = useState(false); // screenshots are still uploading
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  // Load the project when editing
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    adminFetch(`/projects/id/${projectId}`).then(({ data, error, status }) => {
      if (!active) return;
      if (error || !data?.project) {
        setLoadError({ message: error || "Project not found.", notFound: status === 404 || status === 400 });
      } else {
        setValues(toFormValues(data.project));
        setLoadError(null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [projectId, attempt]);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const touch = () => setDirty(true);
  const setField = (key) => (val) => {
    setValues((v) => ({ ...v, [key]: val }));
    touch();
  };
  const setCase = (key) => (val) => {
    setValues((v) => ({ ...v, caseStudy: { ...v.caseStudy, [key]: val } }));
    touch();
  };
  const setTech = (key) => (val) => {
    setValues((v) => ({
      ...v,
      caseStudy: { ...v.caseStudy, techStack: { ...v.caseStudy.techStack, [key]: val } },
    }));
    touch();
  };
  const setArch = (key) => (val) => {
    setValues((v) => ({
      ...v,
      caseStudy: { ...v.caseStudy, architecture: { ...v.caseStudy.architecture, [key]: val } },
    }));
    touch();
  };
  const onInput = (key) => (e) => setField(key)(e.target.value);
  const onCaseInput = (key) => (e) => setCase(key)(e.target.value);

  function onTitleChange(e) {
    const title = e.target.value;
    setValues((v) => ({ ...v, title, slug: isEdit || slugTouched ? v.slug : slugify(title) }));
    touch();
  }
  function onSlugChange(e) {
    setSlugTouched(true);
    setField("slug")(e.target.value.toLowerCase());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const found = validateProject(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setSaving(true);
    const { error, status } = await adminFetch(isEdit ? `/projects/${projectId}` : "/projects", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(toPayload(values)),
    });
    setSaving(false);

    if (error) {
      if (status === 409) setErrors({ slug: error });
      else setFormError(error);
      toast.error(error);
      return;
    }
    setDirty(false);
    toast.success(isEdit ? "Project updated successfully." : "Project created successfully.");
    router.push("/admin/projects");
  }

  /* ---------- loading / error states (edit mode) ---------- */

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
        ))}
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl">
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>{loadError.notFound ? "Project not found." : `Couldn't load this project: ${loadError.message}`}</p>
          <div className="flex gap-2">
            {!loadError.notFound && (
              <button
                onClick={() => {
                  setLoading(true);
                  setAttempt((a) => a + 1);
                }}
                className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800"
              >
                Retry
              </button>
            )}
            <Link href="/admin/projects" className="rounded-md bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700">
              Back to projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- the form ---------- */

  const cs = values.caseStudy;

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? "Edit project" : "Add project"}</h1>
        {isEdit && values.title && <p className="mt-1 text-sm text-slate-400">{values.title}</p>}
      </div>

      {formError && (
        <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {formError}
        </div>
      )}

      <Section title="Basics" description="Shown on the Projects page and at the top of the case study.">
        <Field label="Project title" htmlFor="title" required error={errors.title}>
          <input id="title" type="text" maxLength={120} value={values.title} onChange={onTitleChange} placeholder="e.g. Real-Time Chat Application" className={inputCls} />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          required
          error={errors.slug}
          hint={
            isEdit
              ? `Public URL: /projects/${values.slug}. Changing it breaks existing links to this project.`
              : `Public URL: /projects/${values.slug || "your-slug"}`
          }
        >
          <input id="slug" type="text" maxLength={100} value={values.slug} onChange={onSlugChange} placeholder="real-time-chat-application" className={`${inputCls} font-mono`} />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Category" htmlFor="category">
            <select id="category" value={values.category} onChange={onInput("category")} className={inputCls}>
              {PROJECT_CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" value={values.status} onChange={onInput("status")} className={inputCls}>
              {!values.status && <option value="">Not set</option>}
              {PROJECT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Year" htmlFor="year" error={errors.year}>
            <input id="year" type="number" value={values.year} onChange={onInput("year")} placeholder="2026" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Display order" htmlFor="order" error={errors.order} hint="Lower numbers appear first. Leave empty to add new projects at the end.">
            <input id="order" type="number" min={0} value={values.order} onChange={onInput("order")} className={inputCls} />
          </Field>
          <label className="flex items-center gap-3 self-end rounded-md border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200">
            <input type="checkbox" checked={values.featured} onChange={(e) => setField("featured")(e.target.checked)} className="size-4 accent-indigo-500" />
            Featured project
          </label>
        </div>

        <Field label="Short description" htmlFor="shortDescription" hint="Shown on project cards. Falls back to the description when empty.">
          <textarea id="shortDescription" rows={2} maxLength={240} value={values.shortDescription} onChange={onInput("shortDescription")} className={inputCls} />
        </Field>

        <Field label="Description" htmlFor="description" required error={errors.description} hint="Shown at the top of the case study.">
          <textarea id="description" rows={4} maxLength={1000} value={values.description} onChange={onInput("description")} className={inputCls} />
        </Field>

        <Field label="Technologies" htmlFor="stack" hint="Press Enter or comma to add. Shown on cards and the case study.">
          <TagInput id="stack" value={values.stack} onChange={setField("stack")} placeholder="Next.js, Node.js, MongoDB…" />
        </Field>
      </Section>

      <Section title="Links & image">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="GitHub URL" htmlFor="githubUrl" error={errors.githubUrl}>
            <input id="githubUrl" type="text" inputMode="url" value={values.githubUrl} onChange={onInput("githubUrl")} placeholder="https://github.com/…" className={inputCls} />
          </Field>
          <Field label="Live demo URL" htmlFor="liveUrl" error={errors.liveUrl}>
            <input id="liveUrl" type="text" inputMode="url" value={values.liveUrl} onChange={onInput("liveUrl")} placeholder="https://…" className={inputCls} />
          </Field>
        </div>
        <Field label="Cover image" htmlFor="cover-upload" hint="Shown on the project card. Optional.">
           <CoverImageField value={values.image} onChange={setField("image")} error={errors.image} onBusyChange={setUploading} />
            </Field>
      </Section>

      <Section title="Case study: the story" description="Each section is hidden on the public page when it is empty.">
        <Field label="Overview" htmlFor="overview">
          <textarea id="overview" rows={3} maxLength={3000} value={cs.overview} onChange={onCaseInput("overview")} className={inputCls} />
        </Field>
        <Field label="Problem" htmlFor="problem">
          <textarea id="problem" rows={3} maxLength={3000} value={cs.problem} onChange={onCaseInput("problem")} className={inputCls} />
        </Field>
        <Field label="Goal" htmlFor="goal">
          <textarea id="goal" rows={3} maxLength={3000} value={cs.goal} onChange={onCaseInput("goal")} className={inputCls} />
        </Field>
        <Field label="Solution" htmlFor="solution">
          <textarea id="solution" rows={3} maxLength={3000} value={cs.solution} onChange={onCaseInput("solution")} className={inputCls} />
        </Field>
      </Section>

      <Section title="Features & results">
        <Field label="Key features">
          <StringListEditor label="Feature" value={cs.features} onChange={setCase("features")} placeholder="e.g. JWT authentication" addLabel="Add feature" />
        </Field>
        <Field label="Results" hint="Only list outcomes that really happened. Leave empty rather than inventing numbers.">
          <StringListEditor label="Result" value={cs.results} onChange={setCase("results")} addLabel="Add result" max={20} />
        </Field>
      </Section>

      <Section title="Technology stack by layer">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Frontend" htmlFor="tech-frontend">
            <TagInput id="tech-frontend" value={cs.techStack.frontend} onChange={setTech("frontend")} />
          </Field>
          <Field label="Backend" htmlFor="tech-backend">
            <TagInput id="tech-backend" value={cs.techStack.backend} onChange={setTech("backend")} />
          </Field>
          <Field label="Database" htmlFor="tech-database">
            <TagInput id="tech-database" value={cs.techStack.database} onChange={setTech("database")} />
          </Field>
        </div>
      </Section>

      <Section title="System architecture">
        <Field label="Summary" htmlFor="arch-summary">
          <textarea id="arch-summary" rows={3} maxLength={2000} value={cs.architecture.summary} onChange={(e) => setArch("summary")(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Layers" hint="Order matters: shown as a flow from first to last.">
          <StringListEditor label="Layer" value={cs.architecture.layers} onChange={setArch("layers")} placeholder="e.g. Next.js client" addLabel="Add layer" max={12} maxLength={120} />
        </Field>
      </Section>

      <Section title="Development process">
        <RowsEditor
          value={cs.process}
          onChange={setCase("process")}
          itemLabel="Step"
          addLabel="Add step"
          fields={[
            { key: "title", label: "Step title", maxLength: 120 },
            { key: "description", label: "Description", multiline: true, maxLength: 1000 },
          ]}
        />
      </Section>

      <Section title="Challenges & solutions">
        <RowsEditor
          value={cs.challenges}
          onChange={setCase("challenges")}
          itemLabel="Challenge"
          addLabel="Add challenge"
          fields={[
            { key: "challenge", label: "Challenge", multiline: true, maxLength: 500 },
            { key: "solution", label: "Solution", multiline: true, maxLength: 1000 },
          ]}
        />
      </Section>

      <Section title="Highlights" description="Short facts about the project (for example Auth → JWT). Only add things that are true.">
        <RowsEditor
          value={cs.metrics}
          onChange={setCase("metrics")}
          itemLabel="Highlight"
          addLabel="Add highlight"
          max={8}
          fields={[
            { key: "label", label: "Label", maxLength: 60, placeholder: "Auth" },
            { key: "value", label: "Value", maxLength: 60, placeholder: "JWT" },
            { key: "caption", label: "Caption (optional)", maxLength: 120, placeholder: "Token-based sessions" },
          ]}
        />
      </Section>

      <Section title="Screenshots" description="Shown in the UI Screenshots section of the case study, in this order.">
             <ScreenshotsField value={cs.screenshots} onChange={setCase("screenshots")} error={errors.screenshots} onBusyChange={setShotsUploading} />
       </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Link
          href="/admin/projects"
          onClick={(e) => {
            if (dirty && !window.confirm("Discard unsaved changes?")) e.preventDefault();
          }}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          Cancel
        </Link>
        <button type="submit" disabled={saving || uploading || shotsUploading} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Save project"}
        </button>
      </div>
    </form>
  );
}