# Why I Didn't Add MongoDB Next to Hindsight

I had a table to render: every match a coach logged for an opponent, in order, exact values, nothing missing. My first instinct, because it's everyone's first instinct, was to reach for a database. Then I actually tried building that table out of the memory layer I was already using, and the query that should have been trivial — "give me every match, all of them, in order" — turned out to be the wrong question to ask a memory system at all.

That mismatch is the whole story of how storage ended up split two ways in BattleSession, a scouting agent for esports coaches built on [Hindsight](https://hindsight.vectorize.io/): one path for reasoning, a completely different and much dumber path for exact display. Getting that split wrong in either direction — too much in the database, or trying to make the memory layer do the database's job — would have broken something important.

## The question that exposed the mismatch

`recall()` is a semantic similarity search. Give it a query, it returns the memories most relevant to that query, ranked by relevance. That's exactly the right tool for "what do we know about this opponent's rotation habits" — a fuzzy, meaning-based question with no single correct answer set.

It is the wrong tool for "list all seven matches, numbered one through seven, with the exact map and result I typed in for each." That's not a relevance question. It's an exact, ordered, complete listing, and semantic search doesn't guarantee completeness — it guarantees *relevance*, which is a different property. A recall call can quite reasonably return five of seven matches if the sixth and seventh didn't score as relevant to the query text, and that's not a bug in Hindsight, it's semantic search doing exactly what it's supposed to do. It's a bug in using it for a job it was never built for.

## What actually needed a database, and what didn't

The instinct to add MongoDB at that point was strong, and for about twenty minutes I was going to do it. What stopped me was noticing that the thing I needed wasn't persistence-with-queries — it was a flat, exact cache of what a coach literally typed into a form, so the UI has something deterministic to render:

```js
// Plain JSON file, not a database. Hindsight is the real memory/reasoning layer
// (retain/recall/reflect); this file just caches the exact structured fields a
// coach typed in, so the UI can show a complete, exact match history table
// without depending on semantic recall() (which is a similarity search, not a
// guaranteed "give me everything" listing).

function readDb() {
  if (!existsSync(DB_PATH)) return { opponents: [], matches: [], ourTeam: null };
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

export function listMatches(opponentName) {
  const db = readDb();
  return db.matches
    .filter((m) => m.opponent.toLowerCase() === opponentName.toLowerCase())
    .sort((a, b) => a.matchNumber - b.matchNumber);
}
```

No indexes, no queries beyond a filter and a sort, no schema migrations. A JSON file holds no reasoning at all — it can't tell you what's *interesting* about the data, it can only hand back exactly what was written to it. Hindsight remains the only place tendencies, adaptations, and evidence-backed conclusions get reasoned over. The two stores aren't redundant with each other; they answer different categories of question, and neither one can substitute for the other.

## Where the split actually gets used

The clearest example is a feature that only exists because I kept the two paths separate: scrim games in this sport involve up to sixteen teams in one game, and a coach scouting several of them from the same session needs the *same* game number attached to each opponent's log entry. That's a cross-opponent, exact-integer coordination problem — precisely the kind of thing a flat store handles trivially and a semantic search has no business being asked to do:

```js
// A scrim game has up to 16 teams (64 players) in it at once, so the same
// game number is shared across every opponent the coach logs from that
// session — it is NOT per-opponent. This looks at every match across every
// opponent to suggest the next one.
export function nextGameNumber() {
  const db = readDb();
  const max = db.matches.reduce((m, match) => Math.max(m, match.matchNumber || 0), 0);
  return max + 1;
}

export function listOpponentsInGame(gameNumber) {
  const db = readDb();
  return [...new Set(db.matches.filter((m) => m.matchNumber === gameNumber).map((m) => m.opponent))];
}
```

Two array operations. No database needed. Meanwhile, the question "how has this opponent's identity changed over those seven games" — genuinely hard, genuinely worth an LLM's reasoning — goes entirely through Hindsight's `recall()` and `reflect()`, never through this file.

## Lessons learned

**"I need to persist this" is not the same question as "I need a database."** The flat file persists data just fine. What a database actually buys you — concurrent writes, complex queries, indexing at scale — wasn't a problem this data ever had.

**Match the retrieval guarantee to the question being asked.** Semantic relevance and exact completeness are different guarantees, and conflating them is where I nearly went wrong. Any time I catch myself asking a similarity search for "all of them, in order," that's a signal I'm about to build something with an invisible reliability gap that will show up as missing rows on a bad day.

**Two storage systems is not automatically over-engineering.** It looks like duplication until you notice they hold different *kinds* of truth — one holds what was typed, the other holds what it means — and only one of them is allowed to draw conclusions.

**The interesting part of a memory-backed system is knowing what shouldn't go into memory.** It would have been easy to funnel everything through Hindsight and call it a more "pure" use of agent memory. It would also have made basic UI rendering slower, flakier, and dependent on relevance scoring for a job that never needed relevance scoring in the first place. A tool built for [agent memory](https://vectorize.io/what-is-agent-memory) is for the reasoning, not for every byte the application happens to touch.

**Write down the reason, not just the decision.** The comment at the top of the storage file isn't there to explain what the code does — the code does that. It's there so the next person who looks at a flat JSON file sitting next to a real memory system doesn't reasonably assume it's a mistake and "fix" it by merging the two. If you're weighing the same call, [Hindsight's source](https://github.com/vectorize-io/hindsight) is worth reading before you reach for a database out of habit — it'll tell you faster than I can what recall and consolidation are actually doing under the hood.

<!-- SCREENSHOT: the Match History table rendering exact structured data (the thing this design decision protects) -->
<!-- SCREENSHOT: db.json contents next to a Hindsight memory listing, to visually show the two stores holding different kinds of truth -->
