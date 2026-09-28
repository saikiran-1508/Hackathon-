import * as store from '../data/store.js';

export function getOpponents(req, res) {
  res.json(store.listOpponents());
}

export function createOpponent(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const opponent = store.addOpponent(name.trim());
  res.status(201).json(opponent);
}

export function getOurTeam(req, res) {
  res.json({ ourTeam: store.getOurTeam() });
}

export function putOurTeam(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const ourTeam = store.setOurTeam(name.trim());
    res.json({ ourTeam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
