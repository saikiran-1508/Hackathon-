import { Router } from 'express';
import { getBrief, getMemories } from '../controllers/scoutingController.js';

const router = Router();

router.post('/brief', getBrief);
router.get('/memories/:opponent', getMemories);

export default router;
