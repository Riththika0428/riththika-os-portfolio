export const inputCls =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 disabled:opacity-60";

export default function Field({ label, htmlFor, hint, error, required, children }) {
  const labelCls = "text-sm text-slate-300";
  return (
    <div className="flex flex-col gap-1.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelCls}>
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      ) : (
        <span className={labelCls}>{label}</span>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
}