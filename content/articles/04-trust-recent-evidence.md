# Teaching Hindsight to Trust Recent Evidence Over Old Patterns

For four matches in a row, an opponent in my test data played the same way: passive early game, aggressive once they reached a specific chokepoint, and a drop strategy we could reliably counter with an early split. Four matches is a pattern. Any agent worth using would learn it. The harder question is what the agent should do when match five breaks the pattern completely — and whether it has the judgment to notice.

That's the actual design problem behind BattleSession, a scouting agent for esports coaches built on [Hindsight](https://hindsight.vectorize.io/). The mechanics — log a match, recall history, generate a brief — are the easy 80%. The 20% that makes the output worth reading is whether the agent can tell the difference between "this opponent's identity" and "this opponent's identity three weeks ago."

## The trap: confident, stale advice

An agent with memory but no sense of recency is arguably worse than one with no memory at all. No memory means the coach at least knows to distrust every recommendation. Memory without recency-awareness produces something more dangerous: a confident, well-cited, *wrong* recommendation. "Their early A-split counter has worked in four of four matches, confidence: high" is exactly the kind of sentence that gets someone to walk into a losing fight in match five, because match five is the one where the opponent finally adjusted.

I didn't want to hardcode a decay function — "weight facts from the last N days by X%" — because that number is arbitrary and it doesn't generalize past this one use case. What I wanted was for the agent itself to reason about recency the way an analyst would: notice when recent evidence contradicts older evidence, and treat that contradiction as information in its own right, not noise to average away.

## Where that judgment actually lives

Every opponent gets a dedicated Hindsight bank, created with a mission that becomes the lens `reflect()` reasons through for every future query against that bank:

```js
const BANK_MISSION = (opponent) => `You are the persistent scouting memory for the battle royale
esports opponent "${opponent}". Track recurring tendencies across drops, rotations, aggression,
combat strength, player roles, and team fight structure. Every important conclusion must carry
its supporting evidence (which matches it was observed in) and a confidence level (Low/Medium/High)
based on how many matches support it. Never state a tendency or weakness as settled fact from a
single observation. Distinguish long-term historical patterns from recent changes: when the last
one or two matches contradict older matches, treat that as an adaptation and weight the recent
evidence more heavily than the older pattern. Do not invent players, results, locations, or
statistics that are not present in memory. If evidence is thin, say so explicitly.`;

async function ensureBank(opponent) {
  const bankId = slugify(opponent);
  if (knownBanks.has(bankId)) return bankId;
  await client.createBank(bankId, { name: opponent, reflectMission: BANK_MISSION(opponent) });
  knownBanks.add(bankId);
  return bankId;
}
```

This isn't a per-query instruction — it's attached to the bank itself via `reflectMission`, so every brief generated against that opponent, from now until the coach stops tracking them, reasons under the same standard: cite evidence, distinguish confidence levels, and treat a recent contradiction as a signal rather than something to smooth over.

The retained match data carries the raw material this depends on — every match is timestamped and tagged with its own match number, so "recent" isn't a guess, it's derivable from the actual data:

```js
await client.retain(bankId, matchToProse(match), {
  timestamp: new Date(match.date),
  metadata: {
    opponent: match.opponent,
    map: match.map,
    matchNumber: String(match.matchNumber),
    result: match.result,
  },
});
```

## What it looks like when it works

I built a test history for one opponent: four matches establishing a passive-early, aggressive-late identity, then three more matches where they added mid-map control and started taking fights early instead. Same bank, same mission, just more evidence added over time.

The brief generated after all seven matches didn't average the two phases into a mushy "sometimes passive, sometimes aggressive." It explicitly separated them:

> "Nova Esports has transitioned from a passive, late-game-focused team in August to an aggressive, early-control playstyle in September."

And under a dedicated adaptation field:

> "Nova has pivoted away from their historically passive early-game strategy, now contesting map control early and disrupting opponent rotations in the mid-map."

The recommendation that followed didn't repeat the counter that used to work:

> "Do not assume their August scouting reports are still accurate."

That line only exists because the mission explicitly tells the agent to weight contradicting recent evidence *more* heavily, not just include it. An agent that treats all seven matches as equally weighted evidence would land on "mixed results" — accurate in aggregate, useless in practice, and exactly the kind of hedge that doesn't help a coach decide anything. It's a small example of what [agent memory](https://vectorize.io/what-is-agent-memory) is supposed to buy you over a stateless model: not just a longer context window, but the ability to notice when the present contradicts the past.

## Lessons learned

**Recency-awareness belongs in the reasoning layer, not a preprocessing step.** I considered pre-filtering old matches out of what gets sent to `reflect()`. That would have thrown away the *contrast* that makes an adaptation worth flagging — you can't say "this changed" without keeping the "changed from what."

**A mission attached to the bank outperforms a mission repeated in every prompt.** Setting `reflectMission` once means every future query — written by me, or eventually by someone else calling this bank — inherits the same evidentiary standard, instead of relying on every caller remembering to ask for it correctly.

**Confidence levels are the mechanism that makes "trust recent evidence" safe.** Without a required confidence field, telling an agent to weight recent evidence more heavily is an invitation to overstate a two-match blip as a certainty. Forcing every claim to carry Low/Medium/High confidence, tied to how much evidence actually supports it, keeps the recency instruction honest.

**Test data needs a deliberate contradiction in it, or you'll never know if this actually works.** It's easy to build a demo where every match agrees with every other match — that's the easy case, and it doesn't exercise the part of the system I actually cared about. The interesting failure mode only shows up when you feed the agent evidence that disagrees with itself on purpose.

**"Never state a tendency as settled fact from a single observation" is doing more work than it looks like.** It's one clause in a longer mission, but it's the line standing between "the agent noticed a real change" and "the agent overreacted to one weird match." Getting that balance into the mission text, rather than trying to encode it as a numeric threshold, is what let [Hindsight](https://github.com/vectorize-io/hindsight) reason about it contextually instead of mechanically.

<!-- SCREENSHOT: the "Recent Adaptation" card in the generated brief -->
<!-- SCREENSHOT: match history table showing the aggression-profile shift across matches 1-7 -->
