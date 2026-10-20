/* LEVEL TEMPLATE. Copy to `src/levels/LNN-<id>.js` (NN = level number, id = the id in s0_stories PLAYLIST).
   Files starting with "_" are not built. Workflow and rules: chronicle/LEVELS.md.
   Everything is a function of song time t (seconds); the rail speed per section sets how far the chair travels. */
(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, lerp, ss, M, bx, cy, cn, ic, solid, R } = C;
const ID = 'level-id';           // must match PLAYLIST in s0_stories.js
const DURATION = 300.0;          // song length in s (from the mp3)

/* Sections: t = first sung line of the section (from scripts/align-lyrics.mjs), v = rail speed (m/s),
   motes = dust|ash|embers|fireflies|sparks|confetti|smoke, stamp = small caption (session clock time) shown for 7 s. */
const CUES = [
  { id: 'intro', t: 0, v: 2.3, motes: 'dust', stamp: '', lines: [] },
  { id: 'v1', t: 20, v: 1.8, motes: 'dust', stamp: '7:30 PM', lines: ['First line,', 'Second line,'] },
  { id: 'chorus', t: 60, v: 3.0, motes: 'embers', stamp: '', lines: ['Chorus line one,', 'Chorus line two!'] },
  { id: 'outro', t: 260, v: 0.4, motes: 'smoke', stamp: 'the morning after', lines: ['Last line...'] },
  { id: 'final', t: 290, v: 0.12, motes: 'ash', stamp: '', lines: [] }
];
/* One time per lyric line, in order (aligned to the vocals). Leave null to space lines evenly inside sections. */
const LINE_TIMES = null;

/* Lighting: keyframes of named moods, blended over b seconds before t. Built-in moods (w1_core MOOD_SRC):
   bar outside well wellRed wolves dagger chorus wyrm crater flash glory camp cross dawn march party gaol burn black.
   New ones: C.defineMood('name', fog, fogDensity, skyTop, skyHorizon, hemiSky, hemiGround, hemiI, dirColor, dirI, lampColor, lampI, ground, stars, moon, aurora[, auroraA, auroraB]) */
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 4, m: 'outside', b: 4 }, { t: 60, m: 'chorus', b: 4 }, { t: 260, m: 'dawn', b: 5 },
  { t: DURATION - 8, m: 'black', b: 3 }
];

/* Scenes: one builder per beat of the story, placed along the rail by section.
   X.sec[id] = { t0, t1, d0, d1, len, mid } (rail distances in m); X.at(d, side, h) = point on/next to the rail; X.yawAt(d) = rail heading.
   Kit (w3_kit / w3b_chars, CC0 assets with procedural fallbacks):
     kit.trees(d0, d1, { minSide, maxSide, dens, deadP, tint })      forest + rocks + undergrowth
     kit.village([{ x, z, yaw, w: 4|6, d: 4|6, st: 1|2, brick }], { tint, glass })   modular houses (null if not loaded)
     kit.torches(points, { glow, size }), kit.fire({ scale, size }), kit.placeFacing(obj, d, side)
     C.place('Barrel', [x, y, z], yaw, scale) / C.instModel(key, matrices, { tint })   props, see pack-assets.mjs lists
     ch.lucien / ch.cedric / ch.arthas({ pose: 'Idle_Loop' | 'Walk_Loop' | 'Sprint_Loop' | 'Sitting_Idle_Loop' | 'Spell_Simple_Idle_Loop' | 'Sword_Idle' | ... }), ch.neeris()
     X.glow(color, size, opacity) sprite, ctx.light(slot 0|1, x, y, z, color, intensity, dist) per frame
   Return { group, d0, d1, vis, update(t, ctx) }; the group is only shown while the chair is within vis m. */
const SCENES = [
  function opening(X) {
    const S = X.sec.v1, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
    g.add(kit.trees(S.d0 - 10, S.d1 + 10, { minSide: 8, maxSide: 36, dens: 1.0, deadP: 0.2 }));
    const lu = ch.lucien({ pose: 'Idle_Loop' }), p = X.at(S.mid, 4, 0);
    lu.position.copy(p); lu.rotation.y = X.yawAt(S.mid) - Math.PI / 2; g.add(lu);
    return { group: g, d0: S.d0, d1: S.d1, vis: 100, update(t, ctx) { } };
  }
];

C.levels[ID] = {
  session: 'Level N · Session recap · 7:30 – 10:30 PM',
  blurb: 'Two or three sentences for the book page: what happens in this session, in the party’s voice.',
  length: '5 min', audio: 'levels/NN-' + ID + '.mp3',
  // flashAt: 120.0,      // optional white flash (s) on a big hit
  // gaolCue: 'outro',    // optional: rail heading freezes before this section (used for an end room)
  cues: CUES, keys: KEYS, duration: DURATION, silenceT: DURATION - 3, lineTimes: LINE_TIMES,
  build(X) { return SCENES.map((f) => f(X)).filter(Boolean); }
};
})(typeof window !== 'undefined' ? window : globalThis);
