import { Router } from 'express';
import { getOpponents, createOpponent } from '../controllers/opponentController.js';

const router = Router();

router.get('/', getOpponents);
router.post('/', createOpponent);

export default router;
