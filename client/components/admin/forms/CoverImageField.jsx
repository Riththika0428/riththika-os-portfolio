"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { resolveImage, uploadedImageId } from "@/lib/imageUrl";
import { inputCls } from "@/components/admin/forms/Field";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * Cover image picker for the project form.
 *  - Choosing a file uploads it straight away (multer on the server) and sets the form value
 *    to the uploaded image's URL. The project itself is still saved with the form's Save button.
 *  - Older projects can keep a /public path or an external URL, typed into the text box.
 * `value` is the URL string; `onChange(url)` updates it.
 */
export default function CoverImageField({ value, onChange, error, onBusyChange }) {
  const inputRef = useRef(null);
  const sessionIds = useRef(new Set()); // uploaded during this edit, not saved on the project yet
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [broken, setBroken] = useState(false);

  const uploadedId = uploadedImageId(value);
  const src = value ? resolveImage(value) : "";

  useEffect(() => setBroken(false), [value]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  // An image uploaded during this edit and then replaced/removed is garbage: delete it right away.
  // (An image already saved on the project is deleted by the server when the project is saved.)
  async function discardIfUnsaved(url) {
    const id = uploadedImageId(url);
    if (id && sessionIds.current.has(id)) {
      sessionIds.current.delete(id);
      await adminFetch(`/project-images/${id}`, { method: "DELETE" });
    }
  }

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) return setProblem("Choose a JPG, PNG or WebP image.");
    if (file.size > MAX_BYTES) return setProblem(`That image is ${kb(file.size)}. The maximum is 2 MB.`);

    setProblem("");
    setBusy(true);
    const form = new FormData();
    form.append("image", file); // the server expects the field name "image"
    const { data, error: err } = await adminFetch("/project-images", { method: "POST", body: form });
    setBusy(false);
    if (err || !data?.url) return setProblem(err || "The server didn't confirm the upload.");

    sessionIds.current.add(data.id);
    await discardIfUnsaved(value); // the previous cover, if it was also uploaded in this session
    onChange(data.url);
  }

  async function remove() {
    await discardIfUnsaved(value);
    setProblem("");
    onChange("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative grid h-28 w-52 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-500">
          {src && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="Cover preview" className="size-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <span className="flex flex-col items-center gap-1">
              <ImageIcon className="size-5" aria-hidden="true" />
              {src ? "Can't load this image" : "No cover image"}
            </span>
          )}
          {busy && <div className="absolute inset-0 grid place-items-center bg-slate-950/70 text-sm text-slate-200">Uploading…</div>}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            id="cover-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            disabled={busy}
            aria-label="Upload cover image"
            className="block w-full max-w-sm text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200 hover:file:bg-slate-700"
          />
          <p className="text-xs text-slate-500">JPG, PNG or WebP, up to 2 MB. Wide images (about 16:9) fit the card best. Uploaded when you choose the file; saved with the project.</p>
          {value && (
            <button type="button" onClick={remove} disabled={busy} className="inline-flex items-center gap-2 self-start rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-50">
              <Trash2 className="size-4" /> Remove cover
            </button>
          )}
        </div>
      </div>

      {!uploadedId && (
        <div className="flex flex-col gap-1">
          <label htmlFor="image" className="text-xs text-slate-400">Or use an image URL / a path inside /public</label>
          <input id="image" type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or /projects/chat.png" className={inputCls} />
        </div>
      )}
      {problem && <p role="alert" className="text-sm text-red-300">{problem}</p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}