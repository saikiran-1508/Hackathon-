import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Plain JSON file, not a database. Hindsight is the real memory/reasoning layer
// (retain/recall/reflect); this file just caches the exact structured fields a
// coach typed in, so the UI can show a complete, exact match history table
// without depending on semantic recall() (which is a similarity search, not a
// guaranteed "give me everything" listing).

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

function readDb() {
  if (!existsSync(DB_PATH)) {
    return { opponents: [], matches: [], ourTeam: null };
  }
  const db = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  if (db.ourTeam === undefined) db.ourTeam = null;
  return db;
}

function writeDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function listOpponents() {
  return readDb().opponents;
}

export function addOpponent(name) {
  const db = readDb();
  const existing = db.opponents.find((o) => o.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const opponent = { id: slugify(name), name };
  db.opponents.push(opponent);
  writeDb(db);
  return opponent;
}

// "Our team" is logged with the exact same form/schema as any opponent (a
// coach watching a scrim logs both how the other 15 teams played AND how
// their own team played) — this just remembers which tracked team that is,
// so brief generation can pull in our own tendencies alongside the
// opponent's to produce a matchup-aware recommendation instead of scouting
// the opponent in a vacuum.
export function getOurTeam() {
  return readDb().ourTeam;
}

export function setOurTeam(name) {
  const db = readDb();
  const opponent = db.opponents.find((o) => o.name.toLowerCase() === name.toLowerCase());
  if (!opponent) throw new Error(`Unknown team "${name}" — add it first.`);
  db.ourTeam = opponent.name;
  writeDb(db);
  return opponent.name;
}

export function listMatches(opponentName) {
  const db = readDb();
  return db.matches
    .filter((m) => m.opponent.toLowerCase() === opponentName.toLowerCase())
    .sort((a, b) => a.matchNumber - b.matchNumber);
}

export function addMatch(match) {
  const db = readDb();
  db.matches.push(match);
  writeDb(db);
  return match;
}

// A scrim game has up to 16 teams (64 players) in it at once, so the same
// game number is shared across every opponent the coach logs from that
// session — it is NOT per-opponent. This looks at every match across every
// opponent to suggest the next one.
export function nextGameNumber() {
  const db = readDb();
  const max = db.matches.reduce((m, match) => Math.max(m, match.matchNumber || 0), 0);
  return max + 1;
}

// Every opponent already logged under a given game number, so a coach can see
// which of the up-to-16 teams in that scrim they've scouted so far.
export function listOpponentsInGame(gameNumber) {
  const db = readDb();
  return [...new Set(db.matches.filter((m) => m.matchNumber === gameNumber).map((m) => m.opponent))];
}

export function slugify(name) {
  return (
    'opp-' +
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  );
}
