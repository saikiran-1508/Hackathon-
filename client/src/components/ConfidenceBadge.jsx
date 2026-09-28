const STYLES = {
  High: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Insufficient evidence': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function ConfidenceBadge({ level }) {
  if (!level) return null;
  const style = STYLES[level] || STYLES['Insufficient evidence'];
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>
      {level}
    </span>
  );
}
