export default function MatchHistory({ matches }) {
  if (!matches.length) {
    return <p className="text-sm text-slate-500">No matches logged yet for this opponent.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
            <th className="py-2 pr-4 font-medium">#</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Map</th>
            <th className="py-2 pr-4 font-medium">Result</th>
            <th className="py-2 pr-4 font-medium">Drop</th>
            <th className="py-2 pr-4 font-medium">Aggression (E/M/L)</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id} className="border-b border-slate-900">
              <td className="py-2 pr-4 text-slate-300">{m.matchNumber}</td>
              <td className="py-2 pr-4 text-slate-400">{m.date}</td>
              <td className="py-2 pr-4 text-slate-300">{m.map}</td>
              <td className="py-2 pr-4">
                <span className={m.result === 'Win' ? 'text-emerald-400' : 'text-red-400'}>{m.result}</span>
              </td>
              <td className="py-2 pr-4 text-slate-400">{m.drop?.primary || '-'}</td>
              <td className="py-2 pr-4 text-slate-400">
                {m.aggression?.early?.[0] || '-'}/{m.aggression?.mid?.[0] || '-'}/{m.aggression?.late?.[0] || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
