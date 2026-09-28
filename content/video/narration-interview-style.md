# Narration — simple, interview-briefing style

An alternative to `narration.md`. That version narrates the actual screen and mentions real
function names (recall, reflect). This version is how you'd explain the project out loud if
someone just asked "so what did you build?" — plain language, no code terms, still accurate.
Use whichever style you're more comfortable saying on camera.

---

**What it is (15 sec)**

So this is BattleSense — a scouting assistant for esports coaches, built on a technology called
Hindsight that gives AI agents real, lasting memory. Think of it as the thing that remembers
everything about every opponent, so a coach never starts from zero.

**The problem (30 sec)**

In battle royale esports, a single practice match can have up to sixteen teams in it at once.
A coach is trying to keep track of how all of them play — where they land, how aggressive they
are, who their strongest player is — match after match, week after week. Normally that lives in
someone's head, or scattered notes, or a Discord channel nobody can search. Stuff gets
forgotten, and teams end up repeating strategies that stopped working weeks ago because nobody
remembered the other side had adjusted.

**How it works (30 sec)**

After every match, the coach just types in what happened — a couple of dropdowns and a notes
box. That gets saved into the agent's memory, permanently, tied to that opponent. Before the
next match against the same team, the coach hits one button, and the agent pulls together
everything it has ever learned about them and writes an actual scouting report: their tendencies,
their strengths, their weaknesses, and what to do about it.

**A real example (35 sec)**

Here's the part that actually convinced me this works. I logged seven matches against one
opponent. For the first four, they played it safe early and only got aggressive late. Then in
the last three matches, they completely changed — started playing aggressively right from the
start. The system caught that shift on its own, without being told to look for it, and said
flat out: don't trust the old scouting report anymore, they've adapted. It's not just storing
notes — it's actually noticing when something's changed.

**What I'm proudest of (25 sec)**

The part I'd call out specifically is that it doesn't only profile the opponent. It also
remembers our own team's strengths and weaknesses, and reasons about both sides together. So
instead of a generic "they're weak at long range," it tells us "they're weak at long range, and
that happens to be exactly where we're strong — lean into that." That's a real recommendation,
not just a fact.

**Close (15 sec)**

Building this taught me that the hard part of memory isn't storing information — any database
can do that. The hard part is judgment: knowing what's still true, what's gone stale, and what
to actually do about it. That's what made this feel like a real coaching tool instead of a
chatbot with notes attached.

---

~450 words. At a relaxed, conversational pace (~110–130 wpm, since this style has more natural
pauses than a fast technical narration), that's roughly 3.5–4 minutes — still inside the guide's
2–5 minute window, though on the longer side. Cut the "close" section short if you need to trim.
