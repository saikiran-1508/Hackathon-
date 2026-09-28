import { Router } from 'express';
import { getMatches, createMatch } from '../controllers/matchController.js';

const router = Router();

router.get('/:opponent', getMatches);
router.post('/', createMatch);

export default router;
