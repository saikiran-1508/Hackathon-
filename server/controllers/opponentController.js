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
