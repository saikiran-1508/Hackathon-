# Video Script — BattleSense AI Demo (~3.5 min)

Conversational cues, not a word-for-word script — say it in your own words. `[ON SCREEN: ...]`
marks what to have pulled up before you start talking over it.

---

## Intro — 0:00–0:30

**[ON SCREEN: the dashboard at `localhost:5173`, opponent dropdown showing "Nova Esports"]**

"Hey, I'm [YOUR NAME]. This is BattleSense — a scouting agent for esports coaches. A battle
royale scrim has sixteen teams in it at once, so a coach ends up scouting several opponents
from a single session, plus their own team. Everything here is built on Hindsight for
persistent memory — not a database bolted on the side, actual memory the agent reasons over."

## The problem — 0:30–1:00

**[ON SCREEN: select a brand-new opponent with no matches logged, click Generate, show the
"No memories yet" empty state]**

"Here's the baseline. If I ask for a brief on a team we've never scouted, the agent doesn't
guess — it tells me straight there's not enough evidence yet. That matters more than it sounds
like: an agent that's willing to say 'I don't know' is one I can actually trust when it does
know something. Now watch what happens once there's real history behind it."

## Live demo — 1:00–3:00

**[ON SCREEN: switch to Nova Esports, scroll the Match History table — 7 logged matches]**

"This is seven real scrims against one opponent, logged match by match — drop location,
rotation, aggression, combat ratings, player notes. Each one gets retained into Hindsight as
its own memory, tagged with the match number and result."

**[ON SCREEN: click Generate, show the "Recalling & reflecting..." loading state]**

"Hitting Generate kicks off two calls behind the scenes: `recall()` pulls every relevant memory
for this opponent, then `reflect()` reasons over it — synthesizes it, doesn't just list it
back."

**[ON SCREEN: scroll to Executive Summary, then the Recent Adaptation section of the brief]**

"Matches one through four, this team played passive early, aggressive late. Matches five
through seven, they completely changed — added mid-map control, started fighting early. The
agent didn't average that into 'mixed results.' It flagged the shift directly: don't assume the
old scouting report still holds."

**[ON SCREEN: scroll to the Matchup section]**

"This is the part I think is actually interesting. I marked one team as 'our team' in the app —
logged with the exact same form as any opponent, no special treatment. Now when I generate a
brief, the agent pulls memory from both banks at once and reasons across them: our long-range
strength counters their close-range preference, but their early aggression threatens our own
weak spot. That's not scouting one side of a matchup. That's reasoning across two."

**[ON SCREEN: scroll to the Memories Recalled panel]**

"And every claim in that brief traces back to a real retained memory, right here — you're not
asked to just trust it."

## Takeaway — 3:00–3:30

**[ON SCREEN: back to the dashboard, opponent selector]**

"What surprised me building this wasn't the retain-and-recall loop — that part's almost
mechanical once it's wired up. It was realizing how much of good scouting is really just
refusing to trust stale evidence, and how naturally that maps onto asking an agent to reason
over memory instead of just fetching it. Thanks for watching."

---

## YouTube titles (pick one, or riff)

1. I Gave My AI Agent Memory of 16 Esports Teams at Once
2. Why My AI Scouting Agent Won't Trust Old Data
3. Building an Agent That Remembers Both Sides of a Matchup
4. This AI Agent Catches When Opponents Change Strategy Mid-Season
5. I Built a Memory-Powered Scouting Agent With Hindsight

## Recording checklist (from the Content Guide)

- 1080p minimum, screen recording (talking-head intro optional but adds personality)
- Bump your terminal/browser font size before recording
- Close notifications and unrelated tabs
- Don't read this verbatim — say it in your own words, keep going if you flub a line
