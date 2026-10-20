/* LEVEL TEMPLATE. Copy to `src/levels/LNN-<id>.js` (NN = level number, id = the id in s0_stories PLAYLIST).
   Files starting with "_" are not built. Full runbook: chronicle/LEVELS.md. Reference: level 8 (w1_core CUES, s1a-s1d, L08-baphomet-shots.js).
   Everything is a function of song time t (seconds), so seeking works. */
(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, ss, M, bx, cy, cn, ic, solid, R } = C;
const ID = 'level-id';           // must match PLAYLIST in s0_stories.js
const DURATION = 300.0;          // song length in s (from the mp3)

/* Sections: t = first sung line - 0.5 s (scripts/align-lyrics.mjs), v = story-path speed (m/s: verse 1.3-1.9, chorus 2.6-3.2, endings 0.1-0.4),
   motes = dust|ash|embers|fireflies|sparks|confetti|smoke, stamp = small caption shown 7 s (session clock time). */
const CUES = [
  { id: 'intro', t: 0, v: 1.5, motes: 'dust', stamp: '', lines: [] },
  { id: 'v1', t: 20, v: 1.8, motes: 'dust', stamp: '7:30 PM', lines: ['First line,', 'Second line,'] },
  { id: 'chorus', t: 60, v: 3.0, motes: 'embers', stamp: '', lines: ['Chorus line one,', 'Chorus line two!'] },
  { id: 'outro', t: 260, v: 0.4, motes: 'smoke', stamp: 'the morning after', lines: ['Last line...'] },
  { id: 'final', t: 290, v: 0.12, motes: 'ash', stamp: '', lines: [] }
];
/* One start time per lyric line, in order (align.json lineTimes). */
const LINE_TIMES = null;
/* scripts/beats.py output, rounded: { bpm, beats, bars, hits } (camera kicks on bars, shakes on hits, drummer on beats). */
const BEATS = null;

/* Lighting: named moods blended over b s before t. Built-ins (w1_core MOOD_SRC): bar outside well wellRed wolves dagger chorus wyrm crater
   flash glory camp cross dawn march party gaol burn black. New: C.defineMood('name', fog, fogDensity, skyTop, skyHorizon, hemiSky, hemiGround,
   hemiI, dirColor, dirI, lampColor, lampI, ground, stars, moon, aurora[, auroraA, auroraB]). */
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 18, m: 'outside', b: 3 }, { t: 60, m: 'chorus', b: 4 }, { t: 260, m: 'dawn', b: 5 },
  { t: DURATION - 4, m: 'black', b: 1 }
];

/* Scenes: one builder per story beat, placed by section (X.sec[id] = { t0, t1, d0, d1, len, mid } in path metres).
   X.at(d, side, h) = point on/next to the path, X.yawAt(d) = heading. Publish what the camera films in X.anchors.
   Kit: kit.trees / kit.village / kit.torches / kit.fire / C.place / C.instModel; people ch.lucien / cedric / arthas / neeris / person / wraith;
   creatures C.creature('demon'|'dragon'|'wolf'|'bat', { h, tint, eyes, clip }) -> push to X.anims. See LEVELS.md tables.
   Return { group, d0, d1, vis, update(t, ctx) }; ctx.light(slot 0|1, x, y, z, color, intensity, dist) per frame. */
const SCENES = [
  function opening(X) {
    const S = X.sec.v1, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
    g.add(kit.trees(S.d0 - 10, S.d1 + 10, { minSide: 8, maxSide: 36, dens: 1.0, deadP: 0.2 }));
    const lu = ch.lucien({ pose: 'Walk_Loop' }), p = X.at(S.mid, 4, 0);
    lu.position.copy(p); lu.rotation.y = X.yawAt(S.mid); g.add(lu);
    X.anchors.lucien = lu;
    return { group: g, d0: S.d0, d1: S.d1, vis: 100, update(t, ctx) { } };
  }
];

/* No trees inside these circles (every place the camera orbits). */
function clearings(X) {
  const c = (d, side, r) => { const p = X.at(d, side, 0); return { x: p.x, z: p.z, r }; };
  return [c(X.sec.v1.mid, 4, 12)];
}

/* The music video. One shot per 6-9 s, cut on section starts and bars. D.orbit / track / dolly / rail / fixed (LEVELS.md "Camera").
   Intro: film the tavern (X.hubAnchors.lucien on stage, .cedric/.arthas at their table), then fly out the back door (0, 1.5, -10) at doorAt. */
function shots(X, D) {
  const A = X.anchors, H = X.hubAnchors, V = (x, y, z) => new THREE.Vector3(x, y, z), P = D.p, d = D.dAt;
  const wp = (o) => (o ? o.getWorldPosition(new THREE.Vector3()) : X.at(X.distAt(0) + 30, 0, 0));
  return [
    { t: 0, cam: D.fixed(V(0.4, 2.7, 3.6), V(0, 1.6, -8.6), { push: 0.18, fov: 55 }) },
    { t: 6, cam: D.orbit(H.lucien || V(0, 0.45, -8.55), { r: 2.8, h: 1.2, a0: 1.2, w: 0.09, t0: 6, lookH: 1.4, fov: 50 }) },
    { t: 12, cam: D.orbit(() => wp(H.cedric), { r: 2.8, h: 1.1, a0: 0.2, w: 0.12, t0: 12, lookH: 1.1, fov: 55 }) },
    { t: 16, cam: D.dolly(V(0.9, 2.6, -6.6), V(0, 2.4, -11.2), V(0, 2.1, -16), { lookB: P(30, 0, 2), fov: 60, fov1: 75 }) },
    { t: 19, blend: 0.8, cam: D.dolly(P(9, 0, 2.6), P(d(20) + 5, 0, 3.0), P(30, 0, 2), { lookB: wp(A.lucien), linear: true, fov: 72 }) },
    { t: 20, cam: D.orbit(A.lucien, { r: 5, h: 1.4, a0: 0, w: 0.25, t0: 20, lookH: 1.3, fov: 55 }) },
    { t: 60, cam: D.rail({ h: 3, ahead: 22, lookH: 2, fov: 72 }) },
    { t: 260, blend: 2, cam: D.rail({ h: 1.2, ahead: 12, fov: 60 }) }
  ];
}

C.levels[ID] = {
  session: 'Level N · Session recap · 7:30 – 10:30 PM',
  blurb: 'Two or three sentences for the book page: what happens in this session, in the party’s voice.',
  length: '5 min', audio: 'levels/NN-' + ID + '.mp3',
  packs: ['nature', 'village', 'beasts'],   // art this level downloads when requested (C.PACKS)
  doorAt: 18,                               // tavern back door opens as the camera flies out
  // flashAt: 120.0,                        // optional white flash on a big hit
  // gaolCue: 'outro',                      // optional: path heading freezes before this section (end room)
  cues: CUES, keys: KEYS, duration: DURATION, silenceT: DURATION - 3, lineTimes: LINE_TIMES, beats: BEATS,
  clearings, shots,
  build(X) { return SCENES.map((f) => f(X)).filter(Boolean); }
};
})(typeof window !== 'undefined' ? window : globalThis);
