import { useState } from 'react';

export default function OpponentSelector({ opponents, selected, onSelect, onCreate }) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

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

  return (
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
            {o.name}
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
    </div>
  );
}
