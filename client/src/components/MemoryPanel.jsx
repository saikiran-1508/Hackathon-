export default function MemoryPanel({ memories }) {
  if (!memories?.length) {
    return <p className="text-sm text-slate-500">No memories recalled yet. Generate a brief to see what Hindsight retrieved.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {memories.map((m, i) => (
        <div key={i} className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
            {m.metadata?.matchNumber && <span>Match {m.metadata.matchNumber}</span>}
            {m.metadata?.map && <span>· {m.metadata.map}</span>}
            {m.metadata?.result && <span>· {m.metadata.result}</span>}
          </div>
          <p className="text-sm text-slate-300">{m.text}</p>
        </div>
      ))}
    </div>
  );
}
