// Demo data for the "empty -> informed -> adaptive" narrative the hackathon PDF
// asks for. Matches 1-4 establish a pattern (passive early game, early A split
// works). Matches 5-7 show Nova adapting (mid control added, early aggression),
// which should make the generated brief flag the shift instead of repeating the
// stale "early A split" recommendation. Run with: npm run seed (from server/).
import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import * as store from '../data/store.js';
import { retainMatch } from '../services/hindsightService.js';

const OPPONENT = 'Nova Esports';

const matches = [
  {
    matchNumber: 1,
    date: '2026-08-02',
    map: 'Erangel',
    result: 'Win',
    planePath: 'Southwest -> Northeast (favors Pochinki)',
    drop: { primary: 'Pochinki', secondary: 'Farm', splitLanding: false, contests: false },
    rotation: { firstRotation: 'Pochinki -> Farm', preferredRoute: 'Southern ridge into center', zonePreference: 'edge early, center late' },
    aggression: { early: 'Low', mid: 'Medium', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Moves ahead of team, checks compounds before rotation' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Initiates close-range fights' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Holds rear, provides cover fire' },
    ],
    notes: 'Nova played passively early and only turned aggressive once they reached the southern ridge. Our early A split disrupted their rotation and won us the mid-game fight.',
  },
  {
    matchNumber: 2,
    date: '2026-08-09',
    map: 'Erangel',
    result: 'Win',
    planePath: 'Southwest -> Northeast (favors Pochinki)',
    drop: { primary: 'Pochinki', secondary: 'Farm', splitLanding: false, contests: true },
    rotation: { firstRotation: 'Pochinki -> Farm', preferredRoute: 'Southern ridge into center', zonePreference: 'edge early, center late' },
    aggression: { early: 'Low', mid: 'Medium', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Called rotation early, avoided first contact' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Won two close-range duels' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Consistent cover fire during pushes' },
    ],
    notes: 'Same pattern as Match 1: passive early game, aggressive late. Early A split worked again and let us take the southern ridge uncontested.',
  },
  {
    matchNumber: 3,
    date: '2026-08-16',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Northeast -> Southwest (unfavorable for Pochinki)',
    drop: { primary: 'Farm', secondary: 'Pochinki', splitLanding: false, contests: false },
    rotation: { firstRotation: 'Farm -> Southern ridge', preferredRoute: 'Southern ridge into center', zonePreference: 'center' },
    aggression: { early: 'Low', mid: 'Medium', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Correctly predicted Nova would shift to Farm when plane path was unfavorable' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Lost the final 1v1 in the closing circle' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Died early to third-party while rotating' },
    ],
    notes: 'When the plane path did not favor Pochinki, Nova shifted to Farm instead, confirming a backup-drop pattern. Early read was correct, but we lost the late-zone fight after being separated during rotation.',
  },
  {
    matchNumber: 4,
    date: '2026-08-23',
    map: 'Erangel',
    result: 'Win',
    planePath: 'Southwest -> Northeast (favors Pochinki)',
    drop: { primary: 'Pochinki', secondary: 'Farm', splitLanding: false, contests: false },
    rotation: { firstRotation: 'Pochinki -> Farm', preferredRoute: 'Southern ridge into center', zonePreference: 'edge early, center late' },
    aggression: { early: 'Low', mid: 'Medium', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Consistent early scouting pattern' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Clean entry, no over-peeking this match' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Anchored final zone position' },
    ],
    notes: 'Fourth match confirming the passive-early / aggressive-late identity. Early A split worked a third time and let us control the mid-game tempo.',
  },
  {
    matchNumber: 5,
    date: '2026-09-06',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Southwest -> Northeast (favors Pochinki)',
    drop: { primary: 'Pochinki', secondary: 'Farm', splitLanding: true, contests: true },
    rotation: { firstRotation: 'Pochinki -> Mid compounds', preferredRoute: 'Direct mid-map control instead of southern ridge', zonePreference: 'center' },
    aggression: { early: 'Medium', mid: 'High', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Still scouts first, but calls earlier aggression than before' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Initiated an early fight instead of waiting, unusual for this team' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Pushed alongside Zephyr instead of holding rear' },
    ],
    notes: 'Clear change in behavior: Nova added mid-map control and contested us early instead of playing passive. Our usual early A split failed because they had already split and taken map control before we arrived. This cost us the mid-game and the match.',
  },
  {
    matchNumber: 6,
    date: '2026-09-13',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Southwest -> Northeast (favors Pochinki)',
    drop: { primary: 'Pochinki', secondary: 'Farm', splitLanding: true, contests: true },
    rotation: { firstRotation: 'Pochinki -> Mid compounds', preferredRoute: 'Direct mid-map control', zonePreference: 'center' },
    aggression: { early: 'Medium', mid: 'High', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Still leads rotation calls' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Over-peeked twice after losing the first exchange' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Followed the early push again' },
    ],
    notes: 'Second consecutive match with early mid-map control and early aggression. The passive-early identity from Matches 1-4 no longer describes this team. Zephyr over-peeked repeatedly after losing an engagement, which looks like a repeatable tell.',
  },
  {
    matchNumber: 7,
    date: '2026-09-20',
    map: 'Erangel',
    result: 'Loss',
    planePath: 'Northeast -> Southwest (unfavorable for Pochinki)',
    drop: { primary: 'Farm', secondary: 'Pochinki', splitLanding: true, contests: false },
    rotation: { firstRotation: 'Farm -> Mid compounds', preferredRoute: 'Direct mid-map control', zonePreference: 'center' },
    aggression: { early: 'Medium', mid: 'High', late: 'High' },
    combat: { close: 'Strong', mid: 'Strong', long: 'Average' },
    players: [
      { name: 'Kairo', role: 'IGL / Scout', notes: 'Adapted drop call to Farm given the plane path, kept early aggression' },
      { name: 'Zephyr', role: 'Entry / Assaulter', notes: 'Over-peeked a third straight match after losing the opening fight, got picked off' },
      { name: 'Rex', role: 'Support / Cover', notes: 'Could not cover Zephyr in time after the over-peek' },
    ],
    notes: 'Third straight match with the new early-aggression identity, now combined with the backup Farm drop when plane path is unfavorable. Zephyr over-peeking after a lost engagement has now happened three matches in a row and looks like a genuine, exploitable pattern rather than a one-off.',
  },
];

async function main() {
  store.addOpponent(OPPONENT);
  const existingNumbers = new Set(store.listMatches(OPPONENT).map((m) => m.matchNumber));
  for (const m of matches) {
    if (existingNumbers.has(m.matchNumber)) {
      console.log(`Match ${m.matchNumber} already seeded, skipping.`);
      continue;
    }
    const match = { id: uuid(), opponent: OPPONENT, createdAt: new Date().toISOString(), ...m };
    store.addMatch(match);
    await retainMatch(match);
    console.log(`Retained match ${match.matchNumber} (${match.result}) vs ${OPPONENT}`);
  }
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
