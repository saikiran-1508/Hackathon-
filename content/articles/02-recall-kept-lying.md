# Why Hindsight's Recall Kept Lying to Me

I ran the same query against the same memory bank twice, thirty seconds apart, with no code changes in between. The first call returned zero results. The second returned fifty. Somewhere in between, I'd already shipped a bug report to myself blaming my own retain() calls for silently failing.

They hadn't failed. The memories were there the whole time.

I'm building a scouting agent for esports coaches — BattleSession — on top of [Hindsight](https://hindsight.vectorize.io/) for persistent memory. Coaches log match observations, the agent recalls relevant history, and `reflect()` turns that into a tactical brief. It's a clean loop on paper. In practice, the loop has a race condition in it, and finding it meant distrusting my own debugging instincts for a while.

## The setup

A coach logs a match, and the app retains it into a per-opponent memory bank:

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

Generating a brief later calls `recall()` to check what's known, then `reflect()` to synthesize it. Straightforward — except the first time I seeded seven matches for a test opponent and immediately asked for a brief, the response came back empty:

```json
{ "empty": true, "matchesAnalyzed": 0, "memoriesUsed": [] }
```

Seven matches, just retained, and the agent had "no data." My first assumption was the obvious one: something in my retain payload was silently malformed, or the API key wasn't scoped correctly. I went looking for a bug in my own code.

## Proving it wasn't my code

Before touching anything, I checked what Hindsight itself thought was in the bank, bypassing my app entirely:

```js
const mem = await client.listMemories('opp-nova-esports', { limit: 20 });
console.log(mem.total); // 50
```

Fifty consolidated memory facts. Extracted, timestamped, tagged with the right metadata, `state: "valid"`. The data was there. So I ran `recall()` directly against the same bank, same process, a few seconds later:

```js
const r = await client.recall('opp-nova-esports', 'Nova Esports', { budget: 'high' });
console.log(r.results.length); // 0
```

Zero. Then I ran it again a minute later, no code touched in between:

```js
console.log(r.results.length); // 50, with proper semantic + reranker scores
```

That's when I stopped looking for a bug in my code and started treating "recall says empty" as a claim to verify rather than a fact to trust. The memories exist; the search index that `recall()` reads from just hadn't caught up yet, and there's no way to distinguish "genuinely nothing here" from "still indexing" by looking at a single response.

It got worse. `reflect()` doesn't just read whatever `recall()` already found — it runs its *own* internal retrieval before generating an answer. So even after my app's `recall()` call succeeded, the `reflect()` call immediately after it could independently roll the same bad die and come back with an executive summary that flatly said there was no data on a team I'd just proven, seconds earlier, had seven analyzed matches.

## Retrying a lie until it tells the truth

The fix is unglamorous: don't trust a single empty result, and don't trust a single generation that contradicts evidence you already hold.

```js
async function recallWithRetry(bankId, query, options, attempts = 3, delayMs = 1500) {
  let last;
  for (let i = 0; i < attempts; i++) {
    last = await client.recall(bankId, query, options);
    if (last.results?.length > 0) return last;
    if (i < attempts - 1) await sleep(delayMs);
  }
  return last;
}
```

And for the `reflect()` side, I compare what came back against what I already know is true — if the generated brief has zero player roles, zero strengths, zero weaknesses, and no match count, despite `recall()` having just proven the bank isn't empty, that's a contradiction worth one more attempt:

```js
function looksEmptyDespiteEvidence(brief) {
  const noStrengths = !brief.strengths?.length;
  const noWeaknesses = !brief.weaknesses?.length;
  const noRoles = !brief.playerRoles?.length;
  return !brief.matchesAnalyzed && noStrengths && noWeaknesses && noRoles;
}

if (looksEmptyDespiteEvidence(brief)) {
  await sleep(1500);
  ({ brief, basedOn } = await reflectStructured(bankId, query, BRIEF_JSON_SCHEMA, 'high'));
}
```

After adding both retries, the same seven-match test bank that had returned "insufficient evidence" moments earlier produced a full brief: seven matches analyzed, a correctly identified shift from a passive early-game pattern to an aggressive one, and a specific, evidence-cited weakness in a named player's positioning. Same data, same query, the only difference was refusing to believe the first "no."

## Lessons learned

**Empty is not a fact, it's a claim.** When a search system can plausibly still be indexing, an empty result needs to be treated as "unconfirmed" rather than "confirmed absent," especially right after a write.

**Verify with a boring, unrelated read path before you debug your own code.** `listMemories()` isn't a semantic search — it's closer to a raw list — and it gave me ground truth independent of whatever was wrong (or not wrong) with `recall()`. Reaching for the dumbest, most literal check available saved a lot of time I would have otherwise spent auditing my own retain logic.

**Downstream calls can have their own independent flakiness.** I assumed that once my own `recall()` succeeded, everything after it in the same request would see the same world. It doesn't — `reflect()` does its own retrieval, on its own schedule, and can disagree with what you just confirmed.

**A retry needs a way to know it's lying, not just a way to try again.** The blind "retry on empty" catches one failure mode. The "does this contradict evidence I already hold" check catches a subtler one, and it only works because I kept the `recall()` result around to compare against instead of discarding it once `reflect()` was called.

**This is a normal cost of building on a real memory system, not a reason to avoid one.** [Hindsight](https://github.com/vectorize-io/hindsight) is doing a genuinely hard thing — consolidating raw retained text into searchable, reasoned-over facts — and eventual consistency is the honest tradeoff for that. A memory system that's always instantly perfectly consistent probably isn't doing anything interesting under the hood. The lesson wasn't "avoid this," it was "build for it." It's also why I'd point anyone evaluating [agent memory](https://vectorize.io/what-is-agent-memory) as a category toward reading how consolidation actually works before assuming "memory" means "database with extra steps" — it doesn't, and the differences show up exactly where I hit them.

<!-- SCREENSHOT: terminal output showing recall() returning 0 then 50 results for the same query -->
<!-- SCREENSHOT: the generated brief after the retry succeeded, showing a full "matches analyzed" count -->
