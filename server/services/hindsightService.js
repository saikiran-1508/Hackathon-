import { sdk } from '@vectorize-io/hindsight-client';
import client from '../config/hindsight.js';
import { slugify } from '../data/store.js';

const knownBanks = new Set();

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
  await client.createBank(bankId, {
    name: opponent,
    reflectMission: BANK_MISSION(opponent),
  });
  knownBanks.add(bankId);
  return bankId;
}

function matchToProse(match) {
  const lines = [
    `Match ${match.matchNumber} vs ${match.opponent} on ${match.map} (${match.result}), dated ${match.date}.`,
    match.planePath && `Plane path: ${match.planePath}.`,
    match.drop?.primary &&
      `Drop: primary ${match.drop.primary}${match.drop.secondary ? `, secondary ${match.drop.secondary}` : ''}.` +
        (match.drop.splitLanding ? ' Team split during landing.' : ' Team landed together.') +
        (match.drop.contests ? ' They contested another team on drop.' : ''),
    match.rotation?.firstRotation &&
      `Rotation: first rotation to ${match.rotation.firstRotation}.` +
        (match.rotation.preferredRoute ? ` Preferred route: ${match.rotation.preferredRoute}.` : '') +
        (match.rotation.zonePreference ? ` Zone preference: ${match.rotation.zonePreference}.` : ''),
    match.aggression &&
      `Aggression profile: early game ${match.aggression.early}, mid game ${match.aggression.mid}, late game ${match.aggression.late}.`,
    match.combat &&
      `Combat profile: close range ${match.combat.close}, mid range ${match.combat.mid}, long range ${match.combat.long}.`,
    match.players?.length &&
      `Player roles: ${match.players.map((p) => `${p.name} (${p.role}${p.notes ? ` - ${p.notes}` : ''})`).join('; ')}.`,
    match.notes && `Coach notes: ${match.notes}`,
  ].filter(Boolean);
  return lines.join('\n');
}

export async function retainMatch(match) {
  const bankId = await ensureBank(match.opponent);
  // Metadata values must be strings per the Hindsight API (Record<string, string>).
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

export async function recallMemories(opponent, query) {
  const bankId = await ensureBank(opponent);
  return client.recall(bankId, query || `Everything known about ${opponent}`, {
    budget: 'mid',
  });
}

const CONFIDENCE_ENUM = ['Low', 'Medium', 'High', 'Insufficient evidence'];

const BRIEF_JSON_SCHEMA = {
  type: 'object',
  properties: {
    matchesAnalyzed: { type: 'integer' },
    executiveSummary: { type: 'string' },
    landing: {
      type: 'object',
      properties: { summary: { type: 'string' }, confidence: { type: 'string', enum: CONFIDENCE_ENUM } },
      required: ['summary', 'confidence'],
    },
    rotation: {
      type: 'object',
      properties: { summary: { type: 'string' }, confidence: { type: 'string', enum: CONFIDENCE_ENUM } },
      required: ['summary', 'confidence'],
    },
    aggression: {
      type: 'object',
      properties: { summary: { type: 'string' }, confidence: { type: 'string', enum: CONFIDENCE_ENUM } },
      required: ['summary', 'confidence'],
    },
    combat: {
      type: 'object',
      properties: { summary: { type: 'string' }, confidence: { type: 'string', enum: CONFIDENCE_ENUM } },
      required: ['summary', 'confidence'],
    },
    playerRoles: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, role: { type: 'string' }, notes: { type: 'string' } },
        required: ['name', 'role'],
      },
    },
    teamFightStructure: { type: 'string' },
    strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          evidence: { type: 'string' },
          confidence: { type: 'string', enum: CONFIDENCE_ENUM },
        },
        required: ['claim', 'evidence', 'confidence'],
      },
    },
    weaknesses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          evidence: { type: 'string' },
          confidence: { type: 'string', enum: CONFIDENCE_ENUM },
        },
        required: ['claim', 'evidence', 'confidence'],
      },
    },
    recentAdaptation: { type: 'string' },
    recommendedApproach: { type: 'array', items: { type: 'string' } },
    whatToAvoid: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'executiveSummary',
    'landing',
    'rotation',
    'aggression',
    'combat',
    'strengths',
    'weaknesses',
    'recentAdaptation',
    'recommendedApproach',
    'whatToAvoid',
  ],
};

const BRIEF_QUERY = (opponent) =>
  `Generate a tactical scouting brief for the upcoming match against ${opponent}, covering ` +
  `landing/drop behavior, zone and rotation behavior, aggression profile, combat profile, ` +
  `player roles, team fight structure, strengths, weaknesses, recent adaptation, and a ` +
  `recommended approach. If evidence for a section is thin, say so and mark confidence as ` +
  `"Insufficient evidence" instead of inventing detail.`;

// The published reflect() wrapper doesn't forward response_schema (only
// query/context/budget/tags), but the underlying REST endpoint supports it and
// returns a `structured_output` field. We call the generated SDK function
// directly (still through the same authenticated client) to get that. If this
// ever breaks against a future SDK version, we fall back to asking for JSON in
// the prompt and parsing reflect()'s plain text.
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
    const response = await client.reflect(
      bankId,
      `${query}\n\nRespond with ONLY valid JSON matching this JSON Schema (no markdown fences, no commentary): ${JSON.stringify(schema)}`,
      { budget }
    );
    let brief;
    try {
      brief = JSON.parse(stripCodeFences(response.text));
    } catch {
      brief = { executiveSummary: response.text, parseError: true };
    }
    return { brief, basedOn: response.based_on || null };
  }
}

export async function generateBrief(opponent) {
  const bankId = await ensureBank(opponent);
  const recall = await client.recall(bankId, `All observed tendencies for ${opponent}`, {
    budget: 'high',
  });

  if (!recall.results || recall.results.length === 0) {
    return {
      empty: true,
      matchesAnalyzed: 0,
      memoriesUsed: [],
      brief: null,
    };
  }

  const { brief, basedOn } = await reflectStructured(bankId, BRIEF_QUERY(opponent), BRIEF_JSON_SCHEMA, 'high');

  return {
    empty: false,
    matchesAnalyzed: brief.matchesAnalyzed ?? countDistinctMatches(recall.results),
    memoriesUsed: recall.results.map((r) => ({ text: r.text, metadata: r.metadata })),
    basedOn,
    brief,
  };
}

function stripCodeFences(text) {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
}

function countDistinctMatches(results) {
  const nums = new Set(results.map((r) => r.metadata?.matchNumber).filter((n) => n != null));
  return nums.size || results.length;
}
