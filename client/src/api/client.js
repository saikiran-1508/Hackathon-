const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.detail = data?.detail;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  getOpponents: () => request('/api/opponents'),
  createOpponent: (name) => request('/api/opponents', { method: 'POST', body: JSON.stringify({ name }) }),
  getMatches: (opponent) => request(`/api/matches/${encodeURIComponent(opponent)}`),
  createMatch: (match) => request('/api/matches', { method: 'POST', body: JSON.stringify(match) }),
  getNextGame: () => request('/api/matches/game/next'),
  getGame: (gameNumber) => request(`/api/matches/game/${gameNumber}`),
  getBrief: (opponent) => request('/api/scouting/brief', { method: 'POST', body: JSON.stringify({ opponent }) }),
  getMemories: (opponent, query) =>
    request(`/api/scouting/memories/${encodeURIComponent(opponent)}${query ? `?query=${encodeURIComponent(query)}` : ''}`),
};
