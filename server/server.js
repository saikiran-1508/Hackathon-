import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import opponentRoutes from './routes/opponentRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import scoutingRoutes from './routes/scoutingRoutes.js';

const app = express();

// No auth or sensitive data on this API (scouting notes only), so allow any
// origin rather than requiring Render's CLIENT_ORIGIN to be set to the exact
// deployed frontend URL before it can be reached.
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/opponents', opponentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/scouting', scoutingRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`BattleSense server listening on :${port}`));
