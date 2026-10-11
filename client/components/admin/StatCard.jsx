import Link from "next/link";

export default function StatCard({ label, value, icon: Icon, href, highlight = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl border p-5 transition-colors hover:bg-slate-900 ${
        highlight ? "border-indigo-500/50 bg-indigo-950/30" : "border-slate-800 bg-slate-900/50"
      }`}
    >
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-slate-100">{value}</p>
      </div>
      <Icon className={`size-8 ${highlight ? "text-indigo-400" : "text-slate-600"}`} strokeWidth={1.5} />
    </Link>
  );
}