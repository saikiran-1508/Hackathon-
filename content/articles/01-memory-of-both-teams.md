# I Taught Hindsight to Remember Both Teams, Not Just One

The first scouting brief my agent generated was technically correct and completely useless. It told me the opponent's long-range combat was average. Great. Was that a weakness I could actually exploit, or would my own team walk into a fight they'd also lose? The agent had no idea, because it had only ever been told about the enemy. It didn't know anything about us.

That's the bug that made me rethink the whole memory design of BattleSession — a scouting agent for battle royale esports teams, built on [Hindsight](https://hindsight.vectorize.io/) for persistent memory. A coach logs match observations after every scrim — drop locations, rotation habits, aggression profiles, player tendencies — and the agent recalls and reasons over that history to produce a tactical brief before the next match. The interesting part isn't the logging. It's what happens when you ask the agent for a recommendation and it only has half the picture.

## What the system does

Every opponent gets its own Hindsight bank. When a coach logs a match, the structured form data — drop, rotation, aggression, combat ratings, player notes — gets rendered to prose and retained:

```js
export async function retainMatch(match) {
  const bankId = await ensureBank(match.opponent);
  await client.retain(bankId, matchToProse(match), {
    timestamp: new Date(match.date),
    metadata: {
      opponent: match.opponent,
      map: match.map,
      matchNumber: String(match.matchNumber),
      result: match.result,
    },
  });
  return bankId;
}
```

Each bank is created with a mission that tells the agent how to *reason*, not just what to remember:

```js
const BANK_MISSION = (opponent) => `You are the persistent scouting memory for the battle royale
esports opponent "${opponent}". Track recurring tendencies across drops, rotations, aggression,
combat strength, player roles, and team fight structure. Every important conclusion must carry
its supporting evidence... Never state a tendency or weakness as settled fact from a
single observation. Distinguish long-term historical patterns from recent changes...`;
```

That much worked well on its own. Generate a brief, get evidence-backed tendencies, confidence levels, adaptation detection. The problem showed up the first time I actually tried to *use* one of these briefs to make a decision.

## The core problem: scouting in a vacuum

Battle royale scrims don't work like head-to-head matches. A single game has up to sixteen teams in it. A coach watching that game is scouting several opponents at once — and their own team is one of the sixteen. So the natural question a coach asks isn't "what does this opponent do?" It's "what does this opponent do *against us specifically*?"

A scouting report that says "they're strong at close range" is advice for nobody in particular. A report that says "they're strong at close range, and we're weak there, so don't let them close the distance" is advice you can actually act on. The difference is whether the agent has memory of both sides of the matchup.

The fix wasn't a new memory system. It was recognizing that "our own team" is just another entity a coach logs matches for, using the exact same form, the exact same schema, the exact same bank mechanism I'd already built for opponents. I didn't need a new data model. I needed to stop assuming there was only ever one team worth remembering.

## Making brief generation matchup-aware

The mechanism is: when generating a brief for an opponent, separately recall whatever's known about our own designated team, and feed that into the *same* reflection call as extra grounding.

```js
async function getOurTeamContext(opponent) {
  const ourTeam = getOurTeam();
  if (!ourTeam || ourTeam.toLowerCase() === opponent.toLowerCase()) {
    return { ourTeam: null, context: null };
  }

  const bankId = await ensureBank(ourTeam);
  const recall = await recallWithRetry(
    bankId,
    `Our own team's strengths, weaknesses, combat profile, aggression profile, and playstyle`,
    { budget: 'mid' }
  );
  if (!recall.results?.length) return { ourTeam, context: null };

  const context = recall.results.slice(0, 30).map((r) => `- ${r.text}`).join('\n');
  return { ourTeam, context };
}
```

That context gets stitched into the query sent to the opponent's bank:

```js
return (
  base +
  `\n\nHere is what is separately known about OUR OWN team, "${ourTeamName}" (not the opponent ` +
  `you're scouting — this is us): \n${ourTeamContext}\n\nUse this to fill "matchup": explain how ` +
  `our known strengths line up against ${opponent}'s known weaknesses, and where ${opponent}'s ` +
  `strengths threaten our own known weaknesses. Then make "recommendedApproach" and "whatToAvoid" ` +
  `concrete recommendations FOR "${ourTeamName}" that exploit this specific matchup...`
);
```

I also added a dedicated `matchup` field to the structured brief schema, separate from the opponent's own strengths/weaknesses list, so the UI can render "here's the pairing analysis" as its own distinct section instead of burying it in generic advice.

## What the agent actually said

I logged one match for a placeholder team with the opposite combat profile of the opponent in my test data — strong long-range, weak close-range, aggressive early game — and generated a fresh brief. The `matchup` field came back:

> "Our long-range sniper advantage counters their mid-range/close-quarters preference; however, their early aggression challenges our struggle with close-quarters combat if they close the distance."

That's not a template filling in blanks. The agent connected a fact from *our* bank (weak close-range) to a fact from *their* bank (early aggression, strong close-range) and produced a risk neither bank alone would have surfaced. The recommendations that followed were just as specific:

> "Utilize long-range prowess to whittle down health before they reach mid-map positions."
> "Do not allow Nova to force a close-quarters fight."

Both sentences only make sense if you know both teams' profiles simultaneously. Without our-team memory, the best the agent could do was "they're strong at close range" — true, and useless.

## Lessons learned

**A scouting report with only one side is advice for nobody.** This sounds obvious in hindsight (no pun intended), but it took building the one-sided version and watching it produce hollow output before the gap was obvious.

**Reuse the schema before you reach for a new one.** "Our team" didn't need special-cased fields, forms, or storage — it needed the *same* opponent schema, just with one more flag (`ourTeam` in the local cache) marking which bank represents us. The temptation to build a parallel "self-scouting" system was there, and it would have been wrong.

**Two independent recalls, one reflection.** I don't merge memory banks — that would blur which facts came from which team and make the evidence trail worthless. Instead I run two separate `recall()` calls and combine the *results* in the prompt, keeping the evidence attribution intact so the agent can say "your weakness" versus "our weakness" without confusing them.

**Confidence has to cover the matchup too.** If no team is marked as "ours" yet, the `matchup` field explicitly returns "Insufficient evidence" instead of guessing. An agent that invents information about a team it knows nothing about is worse than one that says nothing.

**The interesting engineering here wasn't storage, it was framing.** Everything the matchup feature needed already existed in the memory layer. The work was entirely in how the prompt asked for reasoning across two banks at once — a reminder that with tools like [Hindsight](https://github.com/vectorize-io/hindsight) providing durable, queryable memory, a lot of what looks like a data-modeling problem is actually a question of what you ask the agent to connect. That's a large part of what [agent memory](https://vectorize.io/what-is-agent-memory) is for: not just remembering more, but reasoning across what's remembered.

<!-- SCREENSHOT: the Matchup section of a generated brief, showing the emerald-highlighted "Matchup" card with confidence badge -->
<!-- SCREENSHOT: the ★ "Mark as our team" control in the opponent selector -->
