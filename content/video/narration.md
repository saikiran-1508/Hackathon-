# Narration only — what to say (no screen cues)

Read it in your own words, don't recite it verbatim. Full version with on-screen cues is in
`script.md` — this file is just the talking part, for reading aloud or rehearsing.

---

**Intro (0:00–0:30)**

Hey, I'm [YOUR NAME]. This is BattleSense — a scouting agent for esports coaches. A battle
royale scrim has sixteen teams in it at once, so a coach ends up scouting several opponents
from a single session, plus their own team. Everything here is built on Hindsight for
persistent memory — not a database bolted on the side, actual memory the agent reasons over.

**The problem (0:30–1:00)**

Here's the baseline. If I ask for a brief on a team we've never scouted, the agent doesn't
guess — it tells me straight there's not enough evidence yet. That matters more than it sounds
like: an agent that's willing to say "I don't know" is one I can actually trust when it does
know something. Now watch what happens once there's real history behind it.

**Live demo, part 1 — the logged history (1:00–1:30)**

This is seven real scrims against one opponent, logged match by match — drop location,
rotation, aggression, combat ratings, player notes. Each one gets retained into Hindsight as
its own memory, tagged with the match number and result.

**Live demo, part 2 — generating the brief (1:30–2:00)**

Hitting Generate kicks off two calls behind the scenes: recall pulls every relevant memory for
this opponent, then reflect reasons over it — synthesizes it, doesn't just list it back.

**Live demo, part 3 — the adaptation (2:00–2:30)**

Matches one through four, this team played passive early, aggressive late. Matches five
through seven, they completely changed — added mid-map control, started fighting early. The
agent didn't average that into "mixed results." It flagged the shift directly: don't assume the
old scouting report still holds.

**Live demo, part 4 — the matchup (2:30–3:00)**

This is the part I think is actually interesting. I marked one team as "our team" in the app —
logged with the exact same form as any opponent, no special treatment. Now when I generate a
brief, the agent pulls memory from both banks at once and reasons across them: our long-range
strength counters their close-range preference, but their early aggression threatens our own
weak spot. That's not scouting one side of a matchup. That's reasoning across two.

**Live demo, part 5 — the evidence trail (3:00–3:10)**

And every claim in that brief traces back to a real retained memory, right here — you're not
asked to just trust it.

**Takeaway (3:10–3:40)**

What surprised me building this wasn't the retain-and-recall loop — that part's almost
mechanical once it's wired up. It was realizing how much of good scouting is really just
refusing to trust stale evidence, and how naturally that maps onto asking an agent to reason
over memory instead of just fetching it. Thanks for watching.

---

~435 words total. At a natural conversational pace (~130 wpm), that's about 3.3 minutes of pure
talking — add pauses for screen-watching beats and it lands around 3.5–4 minutes, inside the
guide's 2–5 minute window.
