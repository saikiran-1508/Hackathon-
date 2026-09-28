import { Router } from 'express';
import { getOpponents, createOpponent, getOurTeam, putOurTeam } from '../controllers/opponentController.js';

const router = Router();

// More specific routes first so they don't collide with any opponent name.
router.get('/our-team', getOurTeam);
router.put('/our-team', putOurTeam);
router.get('/', getOpponents);
router.post('/', createOpponent);

export default router;
