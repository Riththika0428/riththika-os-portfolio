"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MailOpen, Trash2, Search, CheckCheck } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/dates";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { inputCls } from "@/components/admin/forms/Field";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];
const LIMIT = 20;
const SAFE_EMAIL = /^[^\s@]+@[^\s@]+$/;

export default function AdminMessagesPage() {
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // debounced search text sent to the server
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, unread: 0, totalAll: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const busyIds = useRef(new Set());

  // debounce typing so we don't query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((prev) => {
        if (prev !== search.trim()) setPage(1);
        return search.trim();
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ filter, page: String(page), limit: String(LIMIT) });
    if (query) params.set("q", query);
    adminFetch(`/contact?${params}`).then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setError(error || "No data returned");
      } else {
        setMessages((data.messages ?? []).filter(Boolean));
        setMeta({ total: data.total, pages: data.pages, unread: data.unread, totalAll: data.totalAll });
        setError("");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [filter, query, page, attempt]);

  const selected = messages.find((m) => m._id === selectedId) ?? null;

  async function setRead(message, read, { quiet = false } = {}) {
    if (message.read === read || busyIds.current.has(message._id)) return;
    busyIds.current.add(message._id);
    const apply = (value) => {
      setMessages((list) => list.map((m) => (m._id === message._id ? { ...m, read: value } : m)));
      setMeta((m) => ({ ...m, unread: Math.max(0, m.unread + (value ? -1 : 1)) }));
    };
    apply(read); // optimistic
    const { error } = await adminFetch(`/contact/${message._id}`, { method: "PATCH", body: JSON.stringify({ read }) });
    busyIds.current.delete(message._id);
    if (error) {
      apply(!read);
      toast.error(error);
    } else if (!quiet) {
      toast.success(read ? "Marked as read." : "Marked as unread.");
    }
  }

  function open(message) {
    setSelectedId(message._id);
    if (!message.read) setRead(message, true, { quiet: true });
  }

  async function markAllRead() {
    const { data, error } = await adminFetch("/contact/read-all", { method: "POST" });
    if (error) return toast.error(error);
    setMessages((list) => list.map((m) => ({ ...m, read: true })));
    setMeta((m) => ({ ...m, unread: 0 }));
    toast.success(`${data?.updated ?? 0} message${data?.updated === 1 ? "" : "s"} marked as read.`);
    if (filter === "unread") setAttempt((a) => a + 1);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target?._id) return;
    setDeleting(true);
    const { error } = await adminFetch(`/contact/${target._id}`, { method: "DELETE" });
    setDeleting(false);
    if (error) return toast.error(error);
    toast.success("Message deleted.");
    setDeleteTarget(null);
    setSelectedId(null);
    // reload: counts and pagination change, and a now-empty last page must step back
    if (messages.length === 1 && page > 1) setPage((p) => p - 1);
    else setAttempt((a) => a + 1);
  }

  const changeFilter = (key) => {
    setFilter(key);
    setPage(1);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="mt-1 text-sm text-slate-400">
            {meta.unread} unread of {meta.totalAll} total
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={meta.unread === 0}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"
        >
          <CheckCheck className="size-4" /> Mark all as read
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter messages" className="flex rounded-lg border border-slate-800 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => changeFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-sm ${filter === f.key ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label="Search messages"
            placeholder="Search name, email, subject or message"
            maxLength={100}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
          <p>Couldn&apos;t load messages: {error}</p>
          <button onClick={() => setAttempt((a) => a + 1)} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* ---------- list ---------- */}
          <div className="flex flex-col gap-3">
            {loading && messages.length === 0 ? (
              <ul className="flex flex-col gap-2" aria-label="Loading messages">
                {[0, 1, 2].map((i) => <li key={i} className="h-16 animate-pulse rounded-lg border border-slate-800 bg-slate-900/50" />)}
              </ul>
            ) : messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center text-sm text-slate-400">
                {query || filter !== "all" ? "No messages match this view." : "No messages yet. They appear here when someone uses your contact form."}
              </div>
            ) : (
              <ul className={`flex flex-col gap-2 ${loading ? "opacity-60" : ""}`}>
                {messages.map((m) => (
                  <li key={m._id}>
                    <button
                      onClick={() => open(m)}
                      aria-current={m._id === selectedId ? "true" : undefined}
                      className={`flex w-full flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left ${
                        m._id === selectedId ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900/50 hover:bg-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {!m.read && <span className="size-2 shrink-0 rounded-full bg-cyan-400" role="img" aria-label="Unread" />}
                        <span className={`truncate text-sm ${m.read ? "text-slate-300" : "font-semibold text-slate-100"}`}>{m.name}</span>
                        <span className="ml-auto shrink-0 text-[11px] text-slate-500">{formatDateTime(m.receivedAt)}</span>
                      </span>
                      <span className={`truncate text-sm ${m.read ? "text-slate-400" : "text-slate-200"}`}>{m.subject}</span>
                      <span className="line-clamp-1 text-xs text-slate-500">{m.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {meta.pages > 1 && (
              <div className="flex items-center justify-between text-sm text-slate-400">
                <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading} className="rounded-md border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40">Previous</button>
                <span>Page {page} of {meta.pages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.pages || loading} className="rounded-md border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40">Next</button>
              </div>
            )}
          </div>

          {/* ---------- detail ---------- */}
          <section aria-label="Message detail" className="min-h-[12rem] rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            {!selected ? (
              <p className="py-10 text-center text-sm text-slate-500">Select a message to read it.</p>
            ) : (
              <article className="flex flex-col gap-4">
                <header className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-slate-100">{selected.subject}</h2>
                  <p className="text-sm text-slate-300">
                    {selected.name}{" "}
                    {SAFE_EMAIL.test(selected.email) ? (
                      <a className="text-indigo-300 hover:underline" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>
                        &lt;{selected.email}&gt;
                      </a>
                    ) : (
                      <span className="text-slate-500">&lt;{selected.email}&gt;</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">Received {formatDateTime(selected.receivedAt)}</p>
                </header>
                {/* rendered as plain text by React, never as HTML */}
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{selected.message}</p>
                <footer className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                  {SAFE_EMAIL.test(selected.email) && (
                    <a className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>
                      <Mail className="size-4" /> Reply by email
                    </a>
                  )}
                  <button onClick={() => setRead(selected, !selected.read)} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                    <MailOpen className="size-4" /> {selected.read ? "Mark as unread" : "Mark as read"}
                  </button>
                  <button onClick={() => setDeleteTarget(selected)} className="inline-flex items-center gap-2 rounded-md border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40">
                    <Trash2 className="size-4" /> Delete
                  </button>
                </footer>
              </article>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete message?"
        message={deleteTarget ? `Delete the message from ${deleteTarget.name}? This cannot be undone.` : ""}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}