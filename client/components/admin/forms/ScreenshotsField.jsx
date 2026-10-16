"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { resolveImage, uploadedImageId } from "@/lib/imageUrl";
import { inputCls } from "@/components/admin/forms/Field";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ITEMS = 20;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const isHttpUrl = (s) => /^https?:\/\/\S+$/i.test(s);
const isSitePath = (s) => s.startsWith("/") && !s.startsWith("//");

/**
 * Case-study screenshots: a list of image URLs.
 *  - "Upload screenshots" accepts several files at once; each goes to the server (multer) and its URL is added.
 *  - Screenshots can also be added by URL / a path inside /public.
 * `value` is an array of URL strings; `onChange(nextArray)` updates it.
 */
export default function ScreenshotsField({ value, onChange, error, onBusyChange }) {
  const inputRef = useRef(null);
  const latest = useRef(value);
  latest.current = value;
  const sessionIds = useRef(new Set()); // uploaded during this edit, not saved on the project yet
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState([]);
  const [broken, setBroken] = useState(() => new Set());
  const [urlText, setUrlText] = useState("");
  const [urlProblem, setUrlProblem] = useState("");

  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  const room = MAX_ITEMS - value.length;

  async function discardIfUnsaved(url) {
    const id = uploadedImageId(url);
    if (id && sessionIds.current.has(id)) {
      sessionIds.current.delete(id);
      await adminFetch(`/project-images/${id}`, { method: "DELETE" });
    }
  }

  async function onPick(e) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;

    const notes = [];
    const chosen = files.slice(0, room);
    if (files.length > room) notes.push(`Only ${MAX_ITEMS} screenshots are allowed. ${files.length - room} file(s) were skipped.`);

    setBusy(true);
    const urls = [];
    for (const file of chosen) {
      if (!TYPES.includes(file.type)) { notes.push(`${file.name}: choose a JPG, PNG or WebP image.`); continue; }
      if (file.size > MAX_BYTES) { notes.push(`${file.name} is ${kb(file.size)}. The maximum is 2 MB.`); continue; }
      const form = new FormData();
      form.append("image", file); // the server expects the field name "image"
      const { data, error: err } = await adminFetch("/project-images", { method: "POST", body: form });
      if (err || !data?.url) { notes.push(`${file.name}: ${err || "the server didn't confirm the upload."}`); continue; }
      sessionIds.current.add(data.id);
      urls.push(data.url);
    }
    setBusy(false);
    setProblems(notes);
    if (urls.length) onChange([...latest.current, ...urls]);
  }

  async function remove(i) {
    const url = value[i];
    onChange(value.filter((_, idx) => idx !== i));
    await discardIfUnsaved(url);
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function addUrl() {
    const text = urlText.trim();
    if (!text) return;
    if (!isHttpUrl(text) && !isSitePath(text)) return setUrlProblem("Use a full http(s) URL or a path inside /public.");
    if (value.length >= MAX_ITEMS) return setUrlProblem(`Only ${MAX_ITEMS} screenshots are allowed.`);
    setUrlProblem("");
    setUrlText("");
    onChange([...value, text]);
  }

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 ? (
        <p className="text-sm text-slate-500">No screenshots yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => (
            <li key={`${url}-${i}`} className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2">
              <div className="grid aspect-video place-items-center overflow-hidden rounded bg-slate-800 text-xs text-slate-500">
                {broken.has(url) ? (
                  "Can't load this image"
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImage(url)}
                    alt={`Screenshot ${i + 1}`}
                    className="size-full object-cover"
                    onError={() => setBroken((s) => new Set(s).add(url))}
                  />
                )}
              </div>
              <p className="truncate text-[11px] text-slate-500" title={url}>
                {uploadedImageId(url) ? "Uploaded image" : url}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label={`Move screenshot ${i + 1} earlier`} className="rounded p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30">
                    <ArrowLeft className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={busy || i === value.length - 1} aria-label={`Move screenshot ${i + 1} later`} className="rounded p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30">
                    <ArrowRight className="size-4" />
                  </button>
                </div>
                <button type="button" onClick={() => remove(i)} disabled={busy} aria-label={`Remove screenshot ${i + 1}`} className="rounded p-1.5 text-red-300 hover:bg-red-950/40 disabled:opacity-30">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="screenshots-upload" className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          <ImagePlus className="size-4" /> {busy ? "Uploading…" : "Upload screenshots"}
          <input
            ref={inputRef}
            id="screenshots-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            disabled={busy || room <= 0}
            aria-label="Upload screenshots"
            className="sr-only"
          />
        </label>
        <p className="text-xs text-slate-500">
          JPG, PNG or WebP, up to 2 MB each, {MAX_ITEMS} screenshots at most ({value.length} used). You can choose several files at once. They are uploaded when you choose them and saved with the project.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="screenshot-url" className="text-xs text-slate-400">Or add one by URL / a path inside /public</label>
        <div className="flex gap-2">
          <input
            id="screenshot-url"
            type="text"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            placeholder="https://… or /projects/shot.png"
            className={inputCls}
          />
          <button type="button" onClick={addUrl} disabled={busy || !urlText.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50">
            <Plus className="size-4" /> Add
          </button>
        </div>
        {urlProblem && <p role="alert" className="text-sm text-red-300">{urlProblem}</p>}
      </div>

      {problems.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm text-red-300">
          {problems.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}