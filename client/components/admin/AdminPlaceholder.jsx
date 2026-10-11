export default function AdminPlaceholder({ title, phase }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-slate-400">This section is built in {phase}.</p>
    </div>
  );
}