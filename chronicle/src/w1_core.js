/* Alaron Chronicle core: small helpers and level 8's song data (Three.js r128 global build). */
(function (root) {
'use strict';
const THREE = root.THREE;
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const ss = (a, b, x) => sm((x - a) / (b - a));

/* ---------- song timeline (section starts = first sung line - 0.5 s, measured with Whisper on the mp3) ---------- */
const CHORUS = [
  'Sing of the brothers, half of one blood,',
  'Cedric the devout monk, faith like a flood,',
  'Lucien the cursed sorcerer, chaos and clever,',
  'Arthas the paladin, faithful forever!',
  'By fire, by fang, by Baphomet’s well,',
  'We walked the road through the demon’s hell!'];
const DURATION = 366.8;
const CUES = [
  { id: 'intro', t: 0, v: 1.5, motes: 'dust', stamp: '', lines: [] },
  { id: 'v1', t: 47.8, v: 1.7, motes: 'dust', stamp: '7:48 PM', lines: [
    'Arthas bled his hand into the well,', 'Baphomet’s chains broke, and he rose from hell,',
    'The demon spoke, and his voice was low,', '“You freed me, brothers” — the wolf-curse began to grow'] },
  { id: 'v1b', t: 87, v: 1.9, motes: 'ash', stamp: '7:57 PM', lines: [
    'Neeris turning, teeth and claw,', 'Arthas struck to take the hand that broke the law,',
    'The blade came down but it would not land,', 'I stood there, spellless, watching a brother’s failed command'] },
  { id: 'pre', t: 102.1, v: 1.8, motes: 'fireflies', stamp: '8:14 PM', lines: [
    'Then Neeris took my dagger for his own,', 'Drove it in — and stopped the change alone,',
    'The blade that nearly took my life instead', 'Pulled the wolf-curse out and calmed the dead'] },
  { id: 'chorus', t: 117.9, v: 3.0, motes: 'embers', stamp: '', lines: CHORUS },
  { id: 'v2', t: 150.7, v: 2.3, motes: 'embers', stamp: '9:22 PM', lines: [
    'A black wyrm rose, and the sky went red,', 'We struck it down, or so we thought — it fled,',
    '“It wants our gold, it will come again,”', 'Cedric said nothing. Cedric just ran'] },
  { id: 'v2b', t: 164.9, v: 1.9, motes: 'ash', stamp: '9:29 PM', lines: [
    'He left us behind, no shield, no plan,', 'Just rage and a blade in one brother’s hand,',
    'Alone in the dark where the wyrm went to ground,', 'No spell to save him, no brother around'] },
  { id: 'brk', t: 179.7, v: 1.5, motes: 'sparks', stamp: '9:38 PM', lines: ['HE KILLED IT! HE KILLED IT ALONE!'] },
  { id: 'v2c', t: 184, v: 2.2, motes: 'sparks', stamp: '', lines: [
    'Cedric the dragon-slayer, they’ll sing that name,', 'One man, one blade, and a black wyrm’s flame,',
    'He walked back to Cobh with the beast’s head in hand,', 'And the whole damn city rose up to stand'] },
  { id: 'v3', t: 200.5, v: 1.35, motes: 'ash', stamp: '9:46 PM', lines: [
    'Arthas ran off to find Cedric’s side,', 'Left me with Neeris, and the fire inside,',
    'What do I do with a traitor turned tame?', 'The chains aren’t the only thing that changed that day'] },
  { id: 'pre2', t: 217.3, v: 1.5, motes: 'dust', stamp: '10:19 PM', lines: [
    'Neeris begs mercy, says he was betrayed too,', '“Kick the feelings aside — now what will you do?”',
    'Cedric and Arthas want justice, want blood,', 'I let him go instead — my choice, not their flood',
    '“Track the last moonwell, bring its chain to me”'] },
  { id: 'chorus2', t: 237.9, v: 3.0, motes: 'fireflies', stamp: '', lines: CHORUS },
  { id: 'bridge', t: 271.3, v: 2.4, motes: 'sparks', stamp: '10:30 PM', lines: [
    'We marched to Cobh with a dragon’s head held high,', 'Gold in our hands, two-fifty each and the flames climbed high,',
    'I sang of Cedric all the way through the gate,', 'The whole city rose up wild, drunk on fate'] },
  { id: 'bridge2', t: 298.7, v: 1.7, motes: 'confetti', stamp: '10:43 PM', lines: [
    'We drank all night till the dawn came grey,', 'Woke up in makeup, don’t ask, don’t say,',
    'Cedric in a suit stitched from the beasts he’d tamed,', 'And I woke in iron — a thief, they claimed'] },
  { id: 'outro', t: 315.7, v: 0.22, motes: 'smoke', stamp: 'the morning after', lines: [
    'Now Cobh burns beneath a wraith’s cold call,', 'They hunt our blood to feed something that crawls,',
    'Ragnar wakes, and the brothers stand as one,', 'The song’s not over — the war’s just begun...'] },
  { id: 'final', t: 333.5, v: 0.12, motes: 'ash', stamp: '', lines: [] }
];
const HIT_T = 361.0;      // last war-drum hit
const SILENCE_T = 364.0;  // after this: black

/* Lyric line starts, aligned to the vocals with Whisper (scripts/transcribe.py + align-lyrics.mjs); all 58 lines matched. */
const LINE_TIMES = [48.28,54.16,59.04,65.64,87.53,90.47,93.32,96.7,102.56,106.9,110.06,113.28,118.36,121.9,125.22,128.66,131.94,135.28,151.24,155.34,158.62,162.06,165.44,168.76,172.16,175.52,180.2,184.5,187.3,190.6,194.06,201.02,204.04,207.2,211.1,217.82,221.02,224.96,228.1,232.52,238.36,241.82,245.18,248.66,251.94,255.26,271.84,278.18,283.48,291.02,299.18,302.84,306.34,309.88,316.24,319.94,323.6,326.8];


root.__cw = { THREE, TAU, levels: {}, clamp, lerp, sm, ss, storyData: { baphomet: { cues: CUES, duration: DURATION, hitT: HIT_T, silenceT: SILENCE_T, lineTimes: LINE_TIMES } } };
})(typeof window !== 'undefined' ? window : globalThis);
