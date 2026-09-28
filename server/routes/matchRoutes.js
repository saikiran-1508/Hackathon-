import { Router } from 'express';
import { getMatches, createMatch, getNextGame, getGame } from '../controllers/matchController.js';

const router = Router();

// More specific routes first so they don't get swallowed by the /:opponent wildcard.
router.get('/game/next', getNextGame);
router.get('/game/:gameNumber', getGame);
router.get('/:opponent', getMatches);
router.post('/', createMatch);

export default router;
