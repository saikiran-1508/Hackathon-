# Article drafts (Hindsight Content Guide, Part 1)

Five drafts, one per team member, each taking a different angle on the same project so they
don't read as duplicates. All were written directly against this repo's actual code, following
the structure and constraints in `PROMPT 2` of the Content Guide.

| # | File | Angle | Words |
|---|---|---|---|
| 1 | [01-memory-of-both-teams.md](01-memory-of-both-teams.md) | Tracking our own team's memory alongside the opponent's, so briefs recommend a matchup, not just a scouting report | ~1300 |
| 2 | [02-recall-kept-lying.md](02-recall-kept-lying.md) | Debugging Hindsight's recall() returning empty for a bank that provably had data, and building a retry layer | ~1080 |
| 3 | [03-sdk-skipped-structured-output.md](03-sdk-skipped-structured-output.md) | Reaching past the published SDK to get real structured JSON out of reflect() | ~1090 |
| 4 | [04-trust-recent-evidence.md](04-trust-recent-evidence.md) | Getting the agent to flag when an opponent's recent behavior contradicts its own history | ~1140 |
| 5 | [05-didnt-add-mongodb.md](05-didnt-add-mongodb.md) | Why match records live in a flat JSON cache instead of a database, and what stays in Hindsight | ~1140 |

## Compliance (per the Content Guide's pre-submit checklist)

- ✅ No mention of "hackathon" anywhere — title or body — in any of the five (checked)
- ✅ All three required links present in every article: [Hindsight GitHub](https://github.com/vectorize-io/hindsight), [Hindsight docs](https://hindsight.vectorize.io/), [Vectorize agent memory](https://vectorize.io/what-is-agent-memory)
- ✅ Each has a title about the idea/result, not the hackathon; first-person voice; 2-4 real code snippets pulled from this repo; a concrete before/after example; at least one honest limitation or dead end
- ✅ Each is 800–1,500 words (the range from the summary table; also within reach of Prompt 2's 1,200–2,000 target)
- ⬜ Screenshots — each file has `<!-- SCREENSHOT: ... -->` placeholders marking where to drop them in; that's a manual step per the Guide's own Step 3
- ⬜ Published to a public URL — that's Step 4, per person, once you've each personalized your draft

## What's still on each person

1. **Claim one article** — reassign/reorder as you like, they're not locked to any name.
2. **Read it and make it sound like you** — per the guide: "the best articles sound like a real person wrote them." Add your own voice, fix anything that doesn't match how you'd actually say it.
3. **Swap in real screenshots** at each `<!-- SCREENSHOT: ... -->` marker.
4. **Publish** to Medium, Dev.to, Hashnode, Substack, or a LinkedIn Article (not a LinkedIn post — the Guide is explicit these are different).
5. **Submit the link** to one of the suggested subreddits as a Link post (r/llmdevs, r/sideproject, r/aiagents, r/aimemory).

The LinkedIn/X social post (Prompt 3) and video script (Prompt 4/5) from the Content Guide are
separate deliverables, not generated here — ask if you want those drafted too, ideally once an
article is actually live so the post can link to it.
