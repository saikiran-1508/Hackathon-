# Hindsight's SDK Skipped Structured Output, So I Reached Around It

I needed the agent to hand back a JSON object with sixteen named fields — confidence ratings, evidence lists, a matchup analysis — and render it straight into React components. The obvious method for that didn't exist in the SDK I was calling. The REST API underneath it clearly supported it. So I went and called the REST API through the SDK's own internals instead of waiting for a new release.

This is the story of building the brief-generation layer for BattleSession, a scouting agent built on [Hindsight](https://hindsight.vectorize.io/) that turns retained match notes into structured tactical reports. The UI needed real fields — not a paragraph of prose to regex apart — and getting there meant reading compiled JavaScript instead of documentation.

## What I actually needed

`reflect()` is the call that synthesizes memory into an answer. The published method on `HindsightClient` looks like this:

```ts
reflect(bankId: string, query: string, options?: {
  context?: string;
  budget?: Budget;
  tags?: string[];
  tagsMatch?: 'any' | 'all' | 'any_strict' | 'all_strict';
}): Promise<ReflectResponse>;
```

No `response_schema` parameter. `ReflectResponse` itself, though, has a field for it:

```ts
type ReflectResponse = {
  text: string;
  based_on?: ReflectBasedOn | null;
  structured_output?: { [key: string]: unknown } | null;  // <- this
  usage?: TokenUsage | null;
};
```

Structured output existed as a concept in the response type — the wrapper method just never gave you a way to ask for it. My first instinct was to fall back to prompt-based JSON: ask the model to "respond with only valid JSON matching this shape" and `JSON.parse()` the text. That works, sort of, until the model wraps the answer in a sentence, or a markdown fence, or gets a field wrong in a way a real schema validator would have caught. I wanted the real thing.

## Finding the real thing

I went looking in the installed package rather than the docs, since the docs describe the intended public surface and I needed to know what was actually possible underneath it:

```bash
grep -n "reflect(bankId" node_modules/@vectorize-io/hindsight-client/dist/index.js
```

That turned up the wrapper's real implementation:

```js
async reflect(bankId, query, options) {
  const response = await reflect({
    client: this.client,
    path: { bank_id: bankId },
    body: {
      query,
      context: options?.context,
      budget: options?.budget || "low",
      tags: options?.tags,
      tags_match: options?.tagsMatch
      // response_schema never gets forwarded here
    }
  });
  return this.validateResponse(response, "reflect");
}
```

`this.client` is the underlying authenticated HTTP client, and the raw `reflect()` function it calls is also exported from the package under a `sdk` namespace — the same one the class method uses internally, just without the field-stripping in between:

```js
var reflect = (options) => (options.client ?? client).post({
  url: "/v1/default/banks/{bank_id}/reflect",
  ...options,
});
```

The REST body type (`ReflectRequest`) confirmed `response_schema` was a real, documented field on the endpoint itself — just not one the convenience wrapper passed through.

## Calling around the wrapper

Since `this.client` on a `HindsightClient` instance is a plain object property at runtime (TypeScript's `private` doesn't survive compilation to anything JavaScript actually enforces), I could reach into an existing, already-authenticated client and call the raw function directly with the field the wrapper drops:

```js
import { sdk } from '@vectorize-io/hindsight-client';
import client from '../config/hindsight.js'; // an existing HindsightClient instance

async function reflectStructured(bankId, query, schema, budget) {
  try {
    const raw = await sdk.reflect({
      client: client.client,
      path: { bank_id: bankId },
      body: { query, budget, response_schema: schema },
    });
    if (raw.data?.structured_output) {
      return { brief: raw.data.structured_output, basedOn: raw.data.based_on || null };
    }
    throw new Error('structured_output missing from response');
  } catch {
    // fall back to prompt-based JSON if this ever breaks against a future SDK version
    const response = await client.reflect(
      bankId,
      `${query}\n\nRespond with ONLY valid JSON matching this JSON Schema: ${JSON.stringify(schema)}`,
      { budget }
    );
    let brief;
    try { brief = JSON.parse(stripCodeFences(response.text)); }
    catch { brief = { executiveSummary: response.text, parseError: true }; }
    return { brief, basedOn: response.based_on || null };
  }
}
```

The schema itself is a real JSON Schema — sixteen fields, nested confidence enums, required arrays — passed straight through to the API instead of pasted into a prompt as hopeful English.

## What came back

With the real `response_schema` path working, a brief request returns exactly the shape the UI expects, with a `matchup` field, a `strengths` array of `{claim, evidence, confidence}` objects, and everything else typed and ready to render — no parsing, no regex, no "the model added a preamble sentence before the JSON this time." When I deliberately broke the internal-client path to test the fallback, the text-prompt version kicked in without the rest of the app noticing, which is the only reason I trust having the workaround live in production code at all.

## Lessons learned

**Read the compiled output, not just the type declarations, when a public API and a documented type disagree.** The `.d.ts` file told me `structured_output` existed. The `.js` file told me why I wasn't getting it.

**A private field in TypeScript is a compile-time suggestion, not a runtime guarantee, once you're consuming a compiled package.** I wouldn't reach past encapsulation in code I control. Reaching past it in a third-party SDK, to call an officially supported REST field the convenience wrapper simply hadn't forwarded yet, is a different judgment call — and one worth revisiting every time the SDK version bumps.

**Never leave a reach-around without a fallback.** The moment I'm relying on an internal property that isn't part of the SDK's public contract, a version bump can silently remove it. The prompt-based JSON path isn't as clean, but it means a future SDK release degrades this feature instead of crashing it.

**Structured output is worth the extra step.** The alternative — asking nicely for JSON in a prompt and hoping — technically works often enough to ship a demo. It is not something I'd want between a model's raw response and a production UI, and it's a distinction that matters more the deeper you lean on [agent memory](https://vectorize.io/what-is-agent-memory) to drive real interface state instead of a chat window.

**This is the kind of gap that closes fast.** [Hindsight](https://github.com/vectorize-io/hindsight) is under active development, and I'd expect `response_schema` support to land in the public `reflect()` signature soon — at which point this whole workaround becomes three lines instead of thirty. Worth checking the [Hindsight docs](https://hindsight.vectorize.io/) before you copy this pattern; it may already be unnecessary by the time you read it.

<!-- SCREENSHOT: terminal showing the grep into node_modules that found the real reflect() implementation -->
<!-- SCREENSHOT: a rendered brief in the UI with structured fields (confidence badges, matchup card) -->
