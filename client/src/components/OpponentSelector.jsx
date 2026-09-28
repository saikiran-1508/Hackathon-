import { useState } from 'react';

export default function OpponentSelector({ opponents, selected, onSelect, onCreate, ourTeam, onSetOurTeam }) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [settingOurTeam, setSettingOurTeam] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await onCreate(newName.trim());
      setNewName('');
    } finally {
      setAdding(false);
    }
  }

  async function handleSetOurTeam() {
    if (!selected) return;
    setSettingOurTeam(true);
    try {
      await onSetOurTeam(selected);
    } finally {
      setSettingOurTeam(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-400">Opponent</label>
        <select
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={selected || ''}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="" disabled>
            Select opponent...
          </option>
          {opponents.map((o) => (
            <option key={o.id} value={o.name}>
              {o.name === ourTeam ? `★ ${o.name} (our team)` : o.name}
            </option>
          ))}
        </select>
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
            placeholder="New opponent name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
        {selected && selected !== ourTeam && (
          <button
            type="button"
            onClick={handleSetOurTeam}
            disabled={settingOurTeam}
            className="rounded-md border border-amber-500/40 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
          >
            {settingOurTeam ? 'Setting...' : `★ Mark "${selected}" as our team`}
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">
        {ourTeam ? (
          <>
            Our team: <span className="text-amber-400">★ {ourTeam}</span> — log its matches the same way as any
            opponent, and briefs will use it to recommend a matchup-specific approach.
          </>
        ) : (
          'No team marked as "our team" yet — select your own team above and mark it, so briefs can recommend an approach based on your own strengths too.'
        )}
      </p>
    </div>
  );
}
