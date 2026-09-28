import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import OpponentSelector from '../components/OpponentSelector';
import MatchLogForm from '../components/MatchLogForm';
import MatchHistory from '../components/MatchHistory';
import ScoutingBrief from '../components/ScoutingBrief';
import MemoryPanel from '../components/MemoryPanel';

export default function Dashboard() {
  const [opponents, setOpponents] = useState([]);
  const [selected, setSelected] = useState('');
  const [ourTeam, setOurTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [briefResult, setBriefResult] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [briefError, setBriefError] = useState(null);

  const refreshOpponents = useCallback(async () => {
    const list = await api.getOpponents();
    setOpponents(list);
    return list;
  }, []);

  async function handleSetOurTeam(name) {
    const { ourTeam } = await api.setOurTeam(name);
    setOurTeam(ourTeam);
  }

  const refreshMatches = useCallback(async (opponent) => {
    if (!opponent) return setMatches([]);
    const list = await api.getMatches(opponent);
    setMatches(list);
  }, []);

  useEffect(() => {
    refreshOpponents().then((list) => {
      if (list.length && !selected) setSelected(list[0].name);
    });
    api.getOurTeam().then(({ ourTeam }) => setOurTeam(ourTeam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshMatches(selected);
    setBriefResult(null);
    setBriefError(null);
  }, [selected, refreshMatches]);

  async function handleCreateOpponent(name) {
    await api.createOpponent(name);
    await refreshOpponents();
    setSelected(name);
  }

  async function handleMatchSaved(match) {
    try {
      await api.createMatch(match);
    } finally {
      // The server saves the match locally before attempting retain(), so even
      // a 502 (retain failed) means there's a new row worth showing.
      await refreshMatches(selected);
    }
  }

  async function handleGenerateBrief() {
    if (!selected) return;
    setLoadingBrief(true);
    setBriefError(null);
    try {
      const result = await api.getBrief(selected);
      setBriefResult(result);
    } catch (err) {
      setBriefError(err.detail ? `${err.message} — ${err.detail}` : err.message);
    } finally {
      setLoadingBrief(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">BattleSense AI</h1>
        <p className="text-sm text-slate-400">Memory-powered opponent scouting for battle royale esports, built on Hindsight.</p>
      </header>

      <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <OpponentSelector
          opponents={opponents}
          selected={selected}
          onSelect={setSelected}
          onCreate={handleCreateOpponent}
          ourTeam={ourTeam}
          onSetOurTeam={handleSetOurTeam}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-100">Log Match</h2>
          <MatchLogForm opponent={selected} onSaved={handleMatchSaved} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100">Match History</h2>
              <span className="text-xs text-slate-500">{matches.length} logged</span>
            </div>
            <MatchHistory matches={matches} />
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100">Generate Scouting Brief</h2>
              <button
                onClick={handleGenerateBrief}
                disabled={!selected || loadingBrief}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loadingBrief ? 'Recalling & reflecting...' : 'Generate'}
              </button>
            </div>
            {briefError && <p className="text-sm text-red-400">{briefError}</p>}
            {!briefResult && !briefError && (
              <p className="text-sm text-slate-500">Generate a brief to see recurring tendencies, strengths, weaknesses, and recent adaptations.</p>
            )}
          </div>
        </div>
      </div>

      {briefResult && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 lg:col-span-2">
            <ScoutingBrief result={briefResult} />
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-100">Memories Recalled from Hindsight</h2>
            <MemoryPanel memories={briefResult.memoriesUsed} />
          </div>
        </div>
      )}
    </div>
  );
}
