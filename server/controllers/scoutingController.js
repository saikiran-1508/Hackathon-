import { generateBrief, recallMemories } from '../services/hindsightService.js';

export async function getBrief(req, res) {
  const { opponent } = req.body;
  if (!opponent) {
    return res.status(400).json({ error: 'opponent is required' });
  }
  try {
    const result = await generateBrief(opponent);
    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: 'Hindsight recall/reflect failed. Check HINDSIGHT_BASE_URL / HINDSIGHT_API_KEY and the LLM provider key.',
      detail: err.message,
    });
  }
}

export async function getMemories(req, res) {
  const { opponent } = req.params;
  const { query } = req.query;
  try {
    const result = await recallMemories(opponent, query);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: 'Hindsight recall() failed.', detail: err.message });
  }
}
