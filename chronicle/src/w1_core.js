/* Baphomet's Chains: world engine (Three.js r128 global build) */
(function (root) {
'use strict';
const THREE = root.THREE;
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const ss = (a, b, x) => sm((x - a) / (b - a));
function mkRng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let rnd = mkRng(20261020);
const R = (a, b) => a + (b - a) * rnd();
const RP = (a, b) => R(a, b) * (rnd() < 0.5 ? -1 : 1);
const pick = (a) => a[Math.floor(rnd() * a.length)];

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

/* ---------- moods ---------- */
const CF = ['fog', 'skyT', 'skyH', 'hs', 'hg', 'dc', 'lc', 'gr', 'aA', 'aB'];
const NF = ['fd', 'hi', 'di', 'li', 'stars', 'moon', 'aur'];
function mood(fog, fd, skyT, skyH, hs, hg, hi, dc, di, lc, li, gr, stars, moon, aur, aA, aB) {
  return { fog, fd, skyT, skyH, hs, hg, hi, dc, di, lc, li, gr, stars, moon, aur, aA: aA || 0x40ffa0, aB: aB || 0x8060ff };
}
const MOOD_SRC = {
  bar:     mood(0x16100c, 0.010, 0x07080c, 0x16100c, 0xffe0b0, 0x3a2616, 0.95, 0xffd0a0, 0.25, 0xffc27a, 1.1, 0x2a2018, 0, 0, 0),
  outside: mood(0x0c1626, 0.030, 0x04070f, 0x14253f, 0x6a8ac0, 0x131b26, 0.75, 0xa8c4f0, 0.6, 0xffbe78, 1.5, 0x1a2430, 1, 0.8, 0),
  well:    mood(0x0a1426, 0.026, 0x03060e, 0x14284a, 0x7aa0d8, 0x121c2c, 0.8, 0xb4ccff, 0.65, 0x9cc0ff, 1.4, 0x16202e, 1, 1, 0.2, 0x4080ff, 0x60c0ff),
  wellRed: mood(0x260a0e, 0.028, 0x0c0305, 0x3a0f12, 0xb04040, 0x1c0a0c, 0.85, 0xff6a4a, 0.75, 0xff5a38, 1.9, 0x1d1114, 0.6, 0.2, 0),
  wolves:  mood(0x0a1410, 0.034, 0x03070a, 0x0f2018, 0x587a62, 0x0e1612, 0.65, 0x88a898, 0.45, 0xffb060, 1.6, 0x121c16, 0.6, 0.5, 0),
  dagger:  mood(0x0d0f20, 0.030, 0x04050e, 0x1a1c3c, 0x7a7ac8, 0x14142a, 0.75, 0xb0b0ff, 0.55, 0xd0c0ff, 1.6, 0x15162a, 1, 0.9, 0.45, 0x7a60ff, 0xc060ff),
  chorus:  mood(0x1c1230, 0.020, 0x07041a, 0x3a2060, 0xa088e0, 0x241830, 0.9, 0xffd0a0, 0.85, 0xffb868, 1.9, 0x241c30, 1, 0.5, 1, 0x40ffb0, 0x9060ff),
  wyrm:    mood(0x2c0f08, 0.026, 0x120403, 0x7a2810, 0xd0603a, 0x28100a, 0.85, 0xff8040, 0.85, 0xff9040, 1.6, 0x24120c, 0, 0, 0),
  crater:  mood(0x1a0a0c, 0.030, 0x080204, 0x3a1010, 0x803030, 0x180a0c, 0.65, 0xff5030, 0.55, 0xff6a3a, 1.6, 0x1c0e10, 0.3, 0, 0),
  flash:   mood(0xffeed0, 0.016, 0xffe8c0, 0xfff4e0, 0xffffff, 0xffe0b0, 1.7, 0xffffff, 1.6, 0xffffff, 3.2, 0xffd8a0, 0, 0, 0),
  glory:   mood(0x3a2410, 0.022, 0x1a0c08, 0xa05a20, 0xffcc80, 0x3a2410, 1.0, 0xffc070, 1.05, 0xffc060, 1.9, 0x3a2a18, 0.2, 0, 0.5, 0xffc050, 0xff6030),
  camp:    mood(0x10151c, 0.038, 0x04060a, 0x1a232e, 0x7e90a8, 0x10141a, 0.65, 0x9aa8bc, 0.4, 0xffa850, 1.7, 0x161c22, 0.3, 0.3, 0),
  cross:   mood(0x14121c, 0.034, 0x05050c, 0x22202e, 0x8888a8, 0x141218, 0.65, 0xb0b0d0, 0.45, 0xc8d0ff, 1.5, 0x1a1a22, 0.6, 0.6, 0),
  dawn:    mood(0x2c1e30, 0.020, 0x14102e, 0xd08070, 0xffb0a0, 0x2a1c28, 0.95, 0xffc8a0, 0.95, 0xffc080, 1.7, 0x2a2028, 0.5, 0.3, 0.75, 0xffa080, 0xc070ff),
  march:   mood(0x2a1a10, 0.022, 0x100a14, 0x7a4a28, 0xffc890, 0x2a1c10, 0.8, 0xffd090, 0.7, 0xffb860, 1.8, 0x2c2218, 0.2, 0, 0),
  party:   mood(0x281420, 0.026, 0x0a0612, 0x4a2040, 0xffa8c0, 0x2a1620, 1.0, 0xffc0a0, 0.65, 0xffc890, 1.9, 0x2a1c26, 0.6, 0.4, 0),
  gaol:    mood(0x0b0e12, 0.036, 0x040608, 0x141a22, 0x6a7a90, 0x0c0f14, 0.6, 0x8090a8, 0.3, 0xffa860, 1.5, 0x14171b, 0, 0, 0),
  burn:    mood(0x1a1c26, 0.030, 0x0a0c14, 0x5a3430, 0x7a90b8, 0x1a1618, 0.65, 0x7aa0e0, 0.55, 0x80b0ff, 1.4, 0x181a1e, 0.4, 0.2, 0),
  black:   mood(0x030405, 0.050, 0x000000, 0x030405, 0x101418, 0x040506, 0.12, 0x2a3a50, 0.1, 0x5080c0, 0.4, 0x050607, 0, 0, 0)
};
const MOODS = {};
Object.keys(MOOD_SRC).forEach((k) => {
  const s = MOOD_SRC[k], o = {};
  CF.forEach((f) => { o[f] = new THREE.Color(s[f]); });
  NF.forEach((f) => { o[f] = s[f]; });
  MOODS[k] = o;
});
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 4, m: 'outside', b: 4 }, { t: 47.8, m: 'well', b: 4 },
  { t: 54.2, m: 'wellRed', b: 1.6 }, { t: 87.0, m: 'wolves', b: 4 }, { t: 102.1, m: 'dagger', b: 4 },
  { t: 117.9, m: 'chorus', b: 4 }, { t: 150.7, m: 'wyrm', b: 4 }, { t: 164.9, m: 'crater', b: 5 },
  { t: 180.1, m: 'flash', b: 0.2 }, { t: 183.5, m: 'glory', b: 3.2 }, { t: 200.5, m: 'camp', b: 4 },
  { t: 217.3, m: 'cross', b: 4 }, { t: 237.9, m: 'dawn', b: 4 }, { t: 271.3, m: 'march', b: 4 },
  { t: 298.7, m: 'party', b: 3 }, { t: 315.2, m: 'gaol', b: 2.5 }, { t: 319.7, m: 'burn', b: 4 },
  { t: 363.0, m: 'black', b: 0.3 }
];
function newMood() {
  const o = {};
  CF.forEach((f) => { o[f] = new THREE.Color(); });
  NF.forEach((f) => { o[f] = 0; });
  return o;
}
function mixMood(a, b, k, out) {
  CF.forEach((f) => { out[f].copy(a[f]).lerp(b[f], k); });
  NF.forEach((f) => { out[f] = lerp(a[f], b[f], k); });
}
function moodAt(KEYS, t, out) {
  let j = 0;
  for (let i = 0; i < KEYS.length; i++) { if (KEYS[i].t - KEYS[i].b <= t) j = i; }
  if (j === 0) { mixMood(MOODS[KEYS[0].m], MOODS[KEYS[0].m], 0, out); return; }
  const K = KEYS[j];
  const k = K.b > 0 ? ss(K.t - K.b, K.t, t) : (t >= K.t ? 1 : 0);
  mixMood(MOODS[KEYS[j - 1].m], MOODS[K.m], k, out);
}

/* ---------- geometry helpers ---------- */
function M(p, r, s) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0));
  const sc = typeof s === 'number' ? new THREE.Vector3(s, s, s) : (s ? new THREE.Vector3(s[0], s[1], s[2]) : new THREE.Vector3(1, 1, 1));
  return new THREE.Matrix4().compose(new THREE.Vector3(p[0], p[1], p[2]), q, sc);
}
function part(geo, color, m) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (m) g.applyMatrix4(m);
  g.computeVertexNormals();
  const n = g.attributes.position.count, arr = new Float32Array(n * 3), c = new THREE.Color(color);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', g.attributes.position);
  out.setAttribute('normal', g.attributes.normal);
  out.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return out;
}
const bx = (w, h, d, c, p, r) => part(new THREE.BoxGeometry(w, h, d), c, M(p, r));
const cy = (rt, rb, h, seg, c, p, r) => part(new THREE.CylinderGeometry(rt, rb, h, seg), c, M(p, r));
const cn = (rad, h, seg, c, p, r, s) => part(new THREE.ConeGeometry(rad, h, seg), c, M(p, r, s));
const ic = (rad, det, c, p, s, r) => part(new THREE.IcosahedronGeometry(rad, det), c, M(p, r, s));
const tri = (a, b, c3, color) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([a[0], a[1], a[2], b[0], b[1], b[2], c3[0], c3[1], c3[2]]), 3));
  return part(g, color);
};
function merge(list) {
  let total = 0;
  list.forEach((g) => { total += g.attributes.position.count; });
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  list.forEach((g) => {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}
const lamb = (o) => new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true }, o || {}));
const solid = (parts, o) => new THREE.Mesh(merge(parts), lamb(o));
const emis = (parts, o) => new THREE.Mesh(merge(parts), new THREE.MeshBasicMaterial(Object.assign({ vertexColors: true }, o || {})));
function inst(geo, mat, mats) {
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, mats.length));
  mats.forEach((m, i) => im.setMatrixAt(i, m));
  im.count = mats.length;
  im.instanceMatrix.needsUpdate = true;
  im.frustumCulled = false;
  return im;
}

/* ---------- procedural textures ---------- */
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function glowTexture() {
  const c = cv(64, 64), x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function groundTexture() {
  const c = cv(128, 128), x = c.getContext('2d');
  x.fillStyle = '#b8b8b8'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(0,0,0,' + (0.05 + rnd() * 0.07) + ')'; x.beginPath(); x.arc(rnd() * 128, rnd() * 128, 4 + rnd() * 14, 0, TAU); x.fill(); }
  for (let i = 0; i < 900; i++) { const v = Math.floor(130 + rnd() * 110); x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fillRect(rnd() * 128, rnd() * 128, 1 + rnd() * 2.5, 1 + rnd() * 2.5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function plankTexture(base) {
  const c = cv(256, 256), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) {
    x.fillStyle = 'rgba(0,0,0,' + (0.04 + 0.12 * rnd()) + ')'; x.fillRect(0, i * 32, 256, 32);
    x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(0, i * 32, 256, 2);
  }
  for (let i = 0; i < 300; i++) { x.fillStyle = 'rgba(0,0,0,' + (0.06 * rnd()) + ')'; x.fillRect(rnd() * 256, rnd() * 256, 20 + rnd() * 60, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function stoneTexture() {
  const c = cv(256, 256), x = c.getContext('2d');
  x.fillStyle = '#8a8d94'; x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 8; r++) {
    const off = (r % 2) * 32;
    for (let k = -1; k < 5; k++) {
      const v = 120 + Math.floor(rnd() * 40);
      x.fillStyle = 'rgb(' + v + ',' + (v + 2) + ',' + (v + 8) + ')'; x.fillRect(k * 64 + off + 2, r * 32 + 2, 60, 28);
    }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function bannerTexture(kind) {
  const c = cv(128, 256), x = c.getContext('2d');
  const sets = { cedric: ['#1f5a3a', '#7a1c1c', '#f1d9a0'], arthas: ['#e9e2cf', '#c9a24a', '#8a6a1c'], lucien: ['#3a1f6e', '#7a3fd0', '#e8d6ff'] }[kind];
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, sets[0]); g.addColorStop(1, sets[1]);
  x.fillStyle = g; x.fillRect(0, 0, 128, 256);
  x.strokeStyle = sets[2]; x.fillStyle = sets[2]; x.lineWidth = 7; x.lineCap = 'round';
  x.strokeRect(10, 10, 108, 236);
  if (kind === 'cedric') {
    x.beginPath(); x.moveTo(64, 50); x.lineTo(64, 215); x.stroke();
    x.beginPath(); x.moveTo(64, 40); x.lineTo(50, 66); x.lineTo(78, 66); x.closePath(); x.fill();
    x.beginPath(); x.arc(64, 140, 34, 0, TAU); x.stroke();
  } else if (kind === 'arthas') {
    x.beginPath(); x.moveTo(64, 215); x.lineTo(64, 60); x.stroke();
    x.beginPath(); x.moveTo(30, 100); x.lineTo(64, 56); x.lineTo(98, 100); x.stroke();
    x.beginPath(); x.moveTo(32, 150); x.lineTo(96, 150); x.stroke();
  } else {
    x.beginPath();
    for (let a = 0; a < 14; a += 0.1) { const rr = 3 + a * 3.6; const px = 64 + Math.cos(a) * rr, py = 130 + Math.sin(a) * rr; if (a === 0) x.moveTo(px, py); else x.lineTo(px, py); }
    x.stroke();
  }
  return new THREE.CanvasTexture(c);
}
// levels can add their own moods: defineMood(name, fog, fogDensity, skyTop, skyHorizon, hemiSky, hemiGround, hemiI, dirColor, dirI, lampColor, lampI, ground, stars, moon, aurora, auroraA, auroraB)
function defineMood(name, ...args) { const s = mood(...args), o = {}; CF.forEach((f) => { o[f] = new THREE.Color(s[f]); }); NF.forEach((f) => { o[f] = s[f]; }); MOODS[name] = o; }
root.__cw = { THREE, TAU, defineMood, levels: {}, clamp, lerp, sm, ss, mkRng, R, RP, pick, MOODS, newMood, moodAt, storyData: { baphomet: { cues: CUES, keys: KEYS, duration: DURATION, hitT: HIT_T, silenceT: SILENCE_T, lineTimes: LINE_TIMES } }, scenes: { baphomet: [] }, M, part, bx, cy, cn, ic, tri, merge, lamb, solid, emis, inst, cv, glowTexture, groundTexture, plankTexture, stoneTexture, bannerTexture, getRnd: () => rnd };
})(typeof window !== 'undefined' ? window : globalThis);
