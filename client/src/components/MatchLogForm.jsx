import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const EMPTY_PLAYER = { name: '', role: '', notes: '' };

// A scrim has up to 16 teams (64 players) in the same game, so a coach scouts
// several opponents from one session. gameNumber/map/date/planePath describe
// the shared session, not any single opponent, so they're kept separate from
// the per-team fields that DO reset between saves.
const initialGameInfo = () => ({
  gameNumber: '',
  map: '',
  date: new Date().toISOString().slice(0, 10),
  planePath: '',
  result: 'Win',
});

const initialTeamForm = () => ({
  drop: { primary: '', secondary: '', splitLanding: false, contests: false },
  rotation: { firstRotation: '', preferredRoute: '', zonePreference: '' },
  aggression: { early: 'Medium', mid: 'Medium', late: 'Medium' },
  combat: { close: 'Average', mid: 'Average', long: 'Average' },
  players: [{ ...EMPTY_PLAYER }],
  notes: '',
});

const RATING3 = ['Low', 'Medium', 'High'];
const RATING3_COMBAT = ['Weak', 'Average', 'Strong'];

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:outline-none';

export default function MatchLogForm({ opponent, onSaved }) {
  const [gameInfo, setGameInfo] = useState(initialGameInfo());
  const [form, setForm] = useState(initialTeamForm());
  const [opponentsInGame, setOpponentsInGame] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getNextGame()
      .then(({ gameNumber, opponentsLogged }) => {
        setGameInfo((prev) => ({ ...prev, gameNumber: String(gameNumber) }));
        setOpponentsInGame(opponentsLogged);
      })
      .catch(() => {});
  }, []);

  const refreshOpponentsInGame = useCallback((gameNumber) => {
    const n = Number(gameNumber);
    if (!n) return;
    api
      .getGame(n)
      .then(({ opponentsLogged }) => setOpponentsInGame(opponentsLogged))
      .catch(() => {});
  }, []);

  function setGame(key, value) {
    setGameInfo((prev) => ({ ...prev, [key]: value }));
  }

  function set(path, value) {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updatePlayer(idx, field, value) {
    setForm((prev) => {
      const players = [...prev.players];
      players[idx] = { ...players[idx], [field]: value };
      return { ...prev, players };
    });
  }

  function addPlayer() {
    setForm((prev) => ({ ...prev, players: [...prev.players, { ...EMPTY_PLAYER }] }));
  }

  function removePlayer(idx) {
    setForm((prev) => ({ ...prev, players: prev.players.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!opponent) return;
    setSaving(true);
    setError(null);
    try {
      await onSaved({
        opponent,
        matchNumber: Number(gameInfo.gameNumber) || undefined,
        map: gameInfo.map,
        date: gameInfo.date,
        planePath: gameInfo.planePath,
        result: gameInfo.result,
        ...form,
        players: form.players.filter((p) => p.name.trim()),
      });
      // Same scrim, next team: keep the game-level fields (game #, map, date,
      // plane path) so the coach can immediately log the next opponent from
      // this same session without retyping them. Only the per-team fields reset.
      setForm(initialTeamForm());
      refreshOpponentsInGame(gameInfo.gameNumber);
    } catch (err) {
      setError(err.detail ? `${err.message} — ${err.detail}` : err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!opponent) {
    return <p className="text-sm text-slate-500">Select or add an opponent to log a match.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">
          Scrim Game <span className="font-normal text-slate-500">— shared by every team you log from this session</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Field label="Game #">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={gameInfo.gameNumber}
              onChange={(e) => setGame('gameNumber', e.target.value)}
              onBlur={(e) => refreshOpponentsInGame(e.target.value)}
              required
            />
          </Field>
          <Field label="Map">
            <input className={inputClass} value={gameInfo.map} onChange={(e) => setGame('map', e.target.value)} required />
          </Field>
          <Field label="Date">
            <input type="date" className={inputClass} value={gameInfo.date} onChange={(e) => setGame('date', e.target.value)} />
          </Field>
          <Field label="Our Result">
            <select className={inputClass} value={gameInfo.result} onChange={(e) => setGame('result', e.target.value)}>
              <option>Win</option>
              <option>Loss</option>
            </select>
          </Field>
          <Field label="Plane Path">
            <input
              className={inputClass}
              placeholder="e.g. SW -> NE"
              value={gameInfo.planePath}
              onChange={(e) => setGame('planePath', e.target.value)}
            />
          </Field>
        </div>
        {opponentsInGame.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Already scouted in this game: {opponentsInGame.filter((o) => o !== opponent).join(', ') || '(only this team so far)'}
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Landing / Drop</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Primary drop">
            <input className={inputClass} value={form.drop.primary} onChange={(e) => set('drop.primary', e.target.value)} />
          </Field>
          <Field label="Secondary drop">
            <input className={inputClass} value={form.drop.secondary} onChange={(e) => set('drop.secondary', e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.drop.splitLanding} onChange={(e) => set('drop.splitLanding', e.target.checked)} />
            Split landing
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.drop.contests} onChange={(e) => set('drop.contests', e.target.checked)} />
            Contested drop
          </label>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Zone / Rotation</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="First rotation">
            <input
              className={inputClass}
              value={form.rotation.firstRotation}
              onChange={(e) => set('rotation.firstRotation', e.target.value)}
            />
          </Field>
          <Field label="Preferred route">
            <input
              className={inputClass}
              value={form.rotation.preferredRoute}
              onChange={(e) => set('rotation.preferredRoute', e.target.value)}
            />
          </Field>
          <Field label="Zone preference">
            <input
              className={inputClass}
              placeholder="center / edge / mixed"
              value={form.rotation.zonePreference}
              onChange={(e) => set('rotation.zonePreference', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Aggression Profile</h3>
        <div className="grid grid-cols-3 gap-3">
          {['early', 'mid', 'late'].map((k) => (
            <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} game`}>
              <select className={inputClass} value={form.aggression[k]} onChange={(e) => set(`aggression.${k}`, e.target.value)}>
                {RATING3.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Combat Profile</h3>
        <div className="grid grid-cols-3 gap-3">
          {['close', 'mid', 'long'].map((k) => (
            <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} range`}>
              <select className={inputClass} value={form.combat[k]} onChange={(e) => set(`combat.${k}`, e.target.value)}>
                {RATING3_COMBAT.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Player Roles</h3>
          <button type="button" onClick={addPlayer} className="text-xs text-sky-400 hover:text-sky-300">
            + Add player
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {form.players.map((p, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <input
                className={inputClass}
                placeholder="Name"
                value={p.name}
                onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Role (IGL, Entry, Support...)"
                value={p.role}
                onChange={(e) => updatePlayer(idx, 'role', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Observed behavior"
                value={p.notes}
                onChange={(e) => updatePlayer(idx, 'notes', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removePlayer(idx)}
                className="rounded-md border border-slate-700 px-2 text-xs text-slate-400 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Field label="Free-form observations">
          <textarea
            className={`${inputClass} min-h-24`}
            placeholder="Anything not captured above: team fight structure, notable reads, mistakes, adaptations..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </Field>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {saving ? 'Saving to memory...' : 'Save to Memory'}
      </button>
    </form>
  );
}
