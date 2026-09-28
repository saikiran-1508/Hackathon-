# BattleSense AI — Esports Opponent Scouting Agent

An AI scouting agent for battle royale esports coaches, built on **Hindsight** persistent
memory (HackWithHyderabad 3.0). Coaches log structured observations after each match; the
agent recalls everything it has learned about that opponent and reflects on it to produce a
tactical brief — distinguishing long-term tendencies from recent adaptations, and always
attaching evidence + confidence to its conclusions instead of stating guesses as fact.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Memory | Hindsight Cloud (`@vectorize-io/hindsight-client`) — `retain()` / `recall()` / `reflect()` |
| LLM (used by Hindsight under the hood) | Groq (free tier) |
| Structured data | Local JSON file (`server/data/db.json`) — a cache for exact match records, **not** the memory layer. See "Why a JSON file and not MongoDB" below. |

## Project layout

```
esports-ai-agent/
├── client/                  React + Vite + Tailwind dashboard
│   └── src/
│       ├── api/client.js    fetch wrapper for the Express API
│       ├── components/      OpponentSelector, MatchLogForm, MatchHistory,
│       │                    ScoutingBrief, MemoryPanel, ConfidenceBadge
│       └── pages/Dashboard.jsx
├── server/                  Node + Express API
│   ├── config/hindsight.js  HindsightClient singleton
│   ├── services/hindsightService.js   bank mission, retain/recall/reflect, brief schema
│   ├── controllers/, routes/          opponents, matches, scouting endpoints
│   ├── data/store.js        local JSON cache of structured match records
│   └── scripts/seed.js      demo data: 7 matches vs "Nova Esports" showing an adaptation arc
├── render.yaml               Render blueprint for deploying the API
└── package.json               root convenience scripts (run both apps together)
```

## Setup

### 1. Get credentials (you have to do this part — see "Required accounts" below)

Copy the env templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env`:
- `HINDSIGHT_API_KEY` — from your Hindsight Cloud project (ui.hindsight.vectorize.io)
- `GROQ_API_KEY` — from console.groq.com (check the Hindsight Cloud dashboard for exactly
  where it expects this — see the note in `server/config/hindsight.js`)

### 2. Install & run

```bash
npm run install:all
npm run dev
```

This starts the API on `:4000` and the client on `:5173` together.

### 3. Load demo data (optional but recommended for the judging demo)

```bash
npm run seed
```

Loads 7 matches for "Nova Esports" on Erangel: matches 1–4 establish a passive-early /
aggressive-late pattern where an early A-split consistently works; matches 5–7 show Nova
adding mid-map control and taking early fights instead — the brief should flag that shift
instead of repeating the stale advice. This gives you the PDF's requested demo arc for free:
generate a brief with **no** matches loaded (generic, "insufficient evidence"), then after
matches 1–4 (confident historical pattern), then after 5–7 (adaptation flagged).

## Required accounts (I can't create these for you)

1. **Hindsight Cloud** — sign up at https://ui.hindsight.vectorize.io, then in the billing
   section apply promo code `MEMHACK99` for $50 in free credits, then copy your API key.
2. **Groq** (free) — sign up at https://groq.com/ for an LLM key; Hindsight uses an LLM
   under the hood for `reflect()` and fact extraction. Recommended models per the hackathon
   PDF: `openai/gpt-oss-120b` or `qwen/qwen3-32b`.

## How Hindsight is used

- **One bank per opponent** (`server/services/hindsightService.js`), created with a
  `reflectMission` that instructs the agent to: track tendencies with evidence, assign
  confidence levels, never state a single observation as settled fact, and weight recent
  matches more heavily when they contradict older ones (adaptation detection).
- **`retain()`** — called once per logged match. The structured form fields are rendered to
  prose (`matchToProse`) plus metadata (`opponent`, `map`, `matchNumber`, `result`) so recall
  can filter/cite by match.
- **`recall()`** — powers the "Memories Recalled from Hindsight" panel, showing the coach
  exactly which raw memories the brief is based on.
- **`reflect()`** — generates the brief. We request structured JSON output via the API's
  `response_schema` (called through the SDK's internal client directly, since the published
  `reflect()` wrapper doesn't yet forward that option — see the comment in
  `hindsightService.js`), with a text-parsing fallback if that ever breaks.

## Why a JSON file and not MongoDB

The original plan explicitly said not to introduce MongoDB unless there's a specific need.
`recall()` is a semantic similarity search, not a guaranteed "list everything" query, so it's
the wrong tool for rendering an exact match-history table. `server/data/db.json` is just a
flat cache of the exact structured fields a coach typed in — it holds no reasoning and isn't
part of the memory/intelligence layer. Hindsight remains the only place tendencies, patterns,
and adaptations are actually reasoned over.

## Deployment

- **Backend**: `render.yaml` is set up as a Render Blueprint (root dir `server`). Set the
  three secret env vars in the Render dashboard after import.
- **Frontend**: deploy `client/` to Vercel — when importing the repo, set **Root Directory**
  to `client` (Vite is auto-detected). Set `VITE_API_URL` to your deployed Render URL.

## Known simplifications vs. the original full spec

The original brainstorm (16 report sections, a dedicated fight-structure diagram builder,
per-claim recency timelines) was trimmed for hackathon scope:
- Team fight structure is captured as free text (in the match form and in the brief output)
  rather than a dedicated sequence-builder UI.
- The brief has ~11 sections instead of 16; the cut sections' content still surfaces inside
  the kept ones (e.g. "previously successful vs. no-longer-working counters" lives inside
  Recent Adaptation + Recommended Approach rather than being two separate sections).

Flag it if you want any of these restored — happy to add them back.
