import { v4 as uuid } from 'uuid';
import * as store from '../data/store.js';
import { retainMatch } from '../services/hindsightService.js';

export async function getMatches(req, res) {
  const { opponent } = req.params;
  res.json(store.listMatches(opponent));
}

export async function createMatch(req, res) {
  const body = req.body;
  if (!body.opponent || !body.map || !body.result) {
    return res.status(400).json({ error: 'opponent, map, and result are required' });
  }

  store.addOpponent(body.opponent);
  const existingMatches = store.listMatches(body.opponent);

  const match = {
    id: uuid(),
    opponent: body.opponent,
    map: body.map,
    matchNumber: body.matchNumber || existingMatches.length + 1,
    date: body.date || new Date().toISOString().slice(0, 10),
    result: body.result,
    planePath: body.planePath || '',
    drop: body.drop || {},
    rotation: body.rotation || {},
    aggression: body.aggression || {},
    combat: body.combat || {},
    players: body.players || [],
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };

  store.addMatch(match);

  try {
    await retainMatch(match);
  } catch (err) {
    return res.status(502).json({
      error: 'Match saved locally but Hindsight retain() failed. Check HINDSIGHT_BASE_URL / HINDSIGHT_API_KEY.',
      detail: err.message,
      match,
    });
  }

  res.status(201).json(match);
}
