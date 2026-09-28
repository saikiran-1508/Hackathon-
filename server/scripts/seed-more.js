// Second demo dataset, deliberately different from Nova Esports so there's
// real variety when scouting multiple teams: Titan Reapers' weakness is late-
// game positioning, not early-game passivity, and their adaptation arc runs
// the other direction — they get MORE disciplined over time, not more
// aggressive. Also seeds a small "our team" (Meridian Esports) history so the
// matchup feature has real data on both sides without faking it per-session.
// Game numbers 8-13 continue on from Nova Esports' 1-7; Meridian reuses game
// numbers 8 and 11 to demonstrate multiple teams scouted from the same scrim.
// Run with: node scripts/seed-more.js (from server/).
import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import * as store from '../data/store.js';
import { retainMatch } from '../services/hindsightService.js';

const TITAN = 'Titan Reapers';
const OUR_TEAM = 'Meridian Esports';

const titanMatches = [
  {
    matchNumber: 8,
    date: '2026-09-05',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Northeast -> Southwest (favors Pochinki hot drop)',
    drop: { primary: 'Pochinki', secondary: 'School', splitLanding: false, contests: true },
    rotation: { firstRotation: 'Pochinki -> open field rotation', preferredRoute: 'Direct line, minimal cover', zonePreference: 'edge, exposed' },
    aggression: { early: 'High', mid: 'High', late: 'Medium' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Weak' },
    players: [
      { name: 'Raze', role: 'Entry / Fragger', notes: 'Wins the hot drop consistently, gets 2-3 early kills' },
      { name: 'Ilyas', role: 'IGL / Support', notes: 'Calls rotations but struggles to hold Raze back' },
      { name: 'Cato', role: 'Sniper / Anchor', notes: 'Weak long-range engagements, avoids extended fights' },
    ],
    notes: 'Titan Reapers won the Pochinki hot drop cleanly, same as always. Lost the match because Raze pushed alone chasing a knock in the final circle and got caught in the open with no rotation cover. Classic pattern for this team: dominant drop, undisciplined finish.',
  },
  {
    matchNumber: 9,
    date: '2026-09-08',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Northeast -> Southwest (favors Pochinki hot drop)',
    drop: { primary: 'Pochinki', secondary: 'School', splitLanding: false, contests: true },
    rotation: { firstRotation: 'Pochinki -> open field rotation', preferredRoute: 'Direct line, minimal cover', zonePreference: 'edge, exposed' },
    aggression: { early: 'High', mid: 'High', late: 'Medium' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Weak' },
    players: [
      { name: 'Raze', role: 'Entry / Fragger', notes: 'Over-extended again in the third circle, died alone' },
      { name: 'Ilyas', role: 'IGL / Support', notes: 'Held position correctly but was already a player down' },
      { name: 'Cato', role: 'Sniper / Anchor', notes: 'Picked off from range while exposed in open rotation' },
    ],
    notes: 'Second match with the exact same failure point: won the drop, lost the finish. Raze chased a knock again instead of waiting for the team to regroup. Being down a player earlier and earlier is costing them the late circles.',
  },
  {
    matchNumber: 10,
    date: '2026-09-12',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Southwest -> Northeast (unfavorable for Pochinki)',
    drop: { primary: 'School', secondary: 'Pochinki', splitLanding: false, contests: false },
    rotation: { firstRotation: 'School -> open field rotation', preferredRoute: 'Direct line, minimal cover', zonePreference: 'edge, exposed' },
    aggression: { early: 'High', mid: 'High', late: 'Medium' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Weak' },
    players: [
      { name: 'Raze', role: 'Entry / Fragger', notes: 'Slightly more patient this match, but still pushed first into the final zone' },
      { name: 'Ilyas', role: 'IGL / Support', notes: 'Explicitly called for the team to hold a compound instead of rotating in the open' },
      { name: 'Cato', role: 'Sniper / Anchor', notes: 'Held a defensible position for the first time this series' },
    ],
    notes: 'When the plane path did not favor Pochinki they shifted to School instead, confirming a backup-drop pattern like their primary. Lost again, but this time Ilyas explicitly called for holding a compound rather than rotating exposed -- first sign the team is aware of the pattern.',
  },
  {
    matchNumber: 11,
    date: '2026-09-15',
    map: 'Erangel',
    result: 'Win',
    planePath: 'Northeast -> Southwest (favors Pochinki hot drop)',
    drop: { primary: 'Pochinki', secondary: 'School', splitLanding: false, contests: true },
    rotation: { firstRotation: 'Pochinki -> compound hold', preferredRoute: 'Rotate early to a defensible building', zonePreference: 'center, fortified' },
    aggression: { early: 'High', mid: 'Medium', late: 'Low' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Weak' },
    players: [
      { name: 'Raze', role: 'Entry / Fragger', notes: 'Held position after a knock instead of chasing -- waited for Ilyas to confirm the kill' },
      { name: 'Ilyas', role: 'IGL / Support', notes: 'Rotated the team to a compound two zones early' },
      { name: 'Cato', role: 'Sniper / Anchor', notes: 'Anchored the compound with sightlines instead of pushing' },
    ],
    notes: 'First win in this stretch. Full team held a fortified compound instead of rotating in the open, and Raze did not chase his knock in the final circle for the first time. Won the final fight from a defensive position instead of losing it from an exposed one.',
  },
  {
    matchNumber: 12,
    date: '2026-09-19',
    map: 'Erangel',
    result: 'Win',
    planePath: 'Northeast -> Southwest (favors Pochinki hot drop)',
    drop: { primary: 'Pochinki', secondary: 'School', splitLanding: false, contests: true },
    rotation: { firstRotation: 'Pochinki -> compound hold', preferredRoute: 'Rotate early to a defensible building', zonePreference: 'center, fortified' },
    aggression: { early: 'High', mid: 'Medium', late: 'Low' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Weak' },
    players: [
      { name: 'Raze', role: 'Entry / Fragger', notes: 'Consistent with the new pattern, held after knocks' },
      { name: 'Ilyas', role: 'IGL / Support', notes: 'Continues calling early compound rotations' },
      { name: 'Cato', role: 'Sniper / Anchor', notes: 'Still weak in extended long-range trades, but positioning covers for it' },
    ],
    notes: 'Second straight win with the compound-hold approach. The early-game identity (hot drop Pochinki, strong close-range) has not changed at all -- only the late-game discipline has. Long-range combat is still a real weakness, just less exposed now that they are not rotating in the open.',
  },
  {
    matchNumber: 13,
    date: '2026-09-22',
    map: 'Erangel',
    result: 'Win',
    planePath: 'Southwest -> Northeast (unfavorable for Pochinki)',
    drop: { primary: 'School', secondary: 'Pochinki', splitLanding: false, contests: false },
    rotation: { firstRotation: 'School -> compound hold', preferredRoute: 'Rotate early to a defensible building', zonePreference: 'center, fortified' },
    aggression: { early: 'High', mid: 'Medium', late: 'Low' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Weak' },
    players: [
      { name: 'Raze', role: 'Entry / Fragger', notes: 'Fully bought into the new approach, anchors with the team now' },
      { name: 'Ilyas', role: 'IGL / Support', notes: 'Compound-hold call now happens regardless of drop location' },
      { name: 'Cato', role: 'Sniper / Anchor', notes: 'Still their most exploitable angle at range, but rarely caught in the open anymore' },
    ],
    notes: 'Third straight win. The compound-hold discipline now shows up on the backup drop too, not just the primary one -- this looks like a real, settled change rather than a one-off adjustment. Long-range weakness is the one thing that has not moved across any of these matches.',
  },
];

const ourTeamMatches = [
  {
    matchNumber: 8,
    date: '2026-09-05',
    map: 'Erangel',
    result: 'Win',
    combat: { close: 'Average', mid: 'Average', long: 'Strong' },
    aggression: { early: 'Low', mid: 'Medium', late: 'High' },
    rotation: { firstRotation: 'Rotate wide, avoid contested drops', preferredRoute: 'Edge rotation into late-game high ground', zonePreference: 'edge into center, high ground' },
    notes: 'We avoided the Pochinki hot drop entirely and rotated wide. Our long-range engagements won us the final two fights of the match from elevated positions.',
  },
  {
    matchNumber: 11,
    date: '2026-09-15',
    map: 'Erangel',
    result: 'Loss',
    combat: { close: 'Average', mid: 'Average', long: 'Strong' },
    aggression: { early: 'Low', mid: 'Medium', late: 'High' },
    rotation: { firstRotation: 'Rotate wide, avoid contested drops', preferredRoute: 'Edge rotation into late-game high ground', zonePreference: 'edge into center, high ground' },
    notes: 'Held our usual high-ground positioning late, but got picked apart at close range when a team pushed our building directly. Long-range strength does not help once someone is already inside effective range.',
  },
];

async function seedTeam(opponent, matches) {
  store.addOpponent(opponent);
  const existingNumbers = new Set(store.listMatches(opponent).map((m) => m.matchNumber));
  for (const m of matches) {
    if (existingNumbers.has(m.matchNumber)) {
      console.log(`${opponent}: match ${m.matchNumber} already seeded, skipping.`);
      continue;
    }
    const match = { id: uuid(), opponent, createdAt: new Date().toISOString(), ...m };
    store.addMatch(match);
    await retainMatch(match);
    console.log(`Retained ${opponent} match ${match.matchNumber} (${match.result})`);
  }
}

async function main() {
  await seedTeam(TITAN, titanMatches);
  await seedTeam(OUR_TEAM, ourTeamMatches);
  console.log('Seed complete. Titan Reapers and Meridian Esports are both fictional demo data.');
  console.log('Mark "our team" yourself via the API/UI if you want briefs to use Meridian Esports for matchups:');
  console.log(`  PUT /api/opponents/our-team { "name": "${OUR_TEAM}" }`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
