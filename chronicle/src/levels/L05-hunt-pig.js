/* Level 5: The Hunt for the Pig (21/06/2026). Lucien sings.
   The Blackbird -> the night road -> the city square at night, twelve bound in the middle: Lucien on a rooftop sees Severin in the crowd,
   runs the roof tiles and jumps to her feet; eight of the twelve are turning, he refuses her
   -> eight pyres under the moon -> the frightened man -> the cave under the cleansed tree. From here on everything is one cave system:
   the blood troll, the bones, the carved dungeon, Lucien wearing the Pig's face past two shapeshifting druids, eight candles,
   the Pig's keep built in the bottom cavern, the fireball through the lit window (prisoners inside), the Pig grows, Lucien falls.
   Lyrics: Whisper transcript (one unclear line: "Two worms turned"). Beats: scripts/beats.py (80 BPM). */
(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, ss, M, bx, cy, cn, ic, solid, R, pick } = C;
const { chars, put, railPts, lay, severin } = C.lib;
const ID = 'hunt-pig';
const DURATION = 307.7;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

const CHORUS = (played) => ['Oh, Alaron, count the names,', 'Eight small fires, eight small flames,', played ? 'I played them all with a mournful tune,' : 'I play them off with a mournful tune,', played ? 'Sent them home beneath the moon' : 'Send them home beneath the moon', 'Oh, Alaron, hear me now,', 'Loss is a debt, and I don’t know how'];
const CUES = [
  { id: 'intro', t: 0, v: 0.4, motes: 'dust', stamp: '', lines: [] },
  { id: 'road', t: 26, v: 2.0, motes: 'fireflies', stamp: '21/06/2026', lines: [] },
  { id: 'ruin', t: 55, v: 1.0, motes: 'dust', stamp: 'the city', lines: [] },
  { id: 'v1', t: 67.5, v: 0.9, motes: 'fireflies', stamp: '', lines: ['I ran the tiles, I fell through air,', 'Landed at her feet, and she was there,', 'Severin, real as blood, real as bone,', 'Asked me home to what I’ve grown', '“Better let the dying go,', 'The ones still turning still don’t know,”', 'She said, “We’re already dead, all of us are,”', 'I would not follow that kind of star', 'Eight souls turning in the dark,', 'My brothers holding back the mark,', 'I chose the innocent, not the crown she wore,', 'That’s a debt I’m answering for'] },
  { id: 'chorus', t: 108.0, v: 1.0, motes: 'embers', stamp: '', lines: CHORUS(false) },
  { id: 'inst', t: 128.0, v: 2.4, motes: 'dust', stamp: '', lines: [] },
  { id: 'v2', t: 138.4, v: 1.5, motes: 'dust', stamp: '', lines: ['We bled the truth from a frightened man,', 'His mind cracked open like broken glass,', 'The cave, the tree we’d cleansed before,', 'The pig was waiting past that door', 'A blood troll fell before we passed,', 'We found the bones, the builders passed,', 'A dungeon carved by careful hand,', 'Not nature’s work, no, this was planned'] },
  { id: 'v2b', t: 162.4, v: 1.0, motes: 'ash', stamp: '', lines: ['I wore his face, I lied my way,', 'Two worms turned and walked away,', 'They chose their shape, they chose their chain,', 'I sent them out, we slipped the pen'] },
  { id: 'chorus2', t: 175.8, v: 0.8, motes: 'embers', stamp: '', lines: CHORUS(true) },
  { id: 'deep', t: 196.0, v: 2.2, motes: 'ash', stamp: 'the bottom of the cave', lines: [] },
  { id: 'bridge', t: 217.9, v: 0.5, motes: 'sparks', stamp: '', lines: ['A window lit, I threw the flame,', 'I didn’t know who bore the blame,', 'Innocence burned where he had bled,', 'Another weight, another dead', 'This is a burden I will carry,', 'This will change me,', 'This will change me'] },
  { id: 'v3', t: 248.6, v: 0.35, motes: 'embers', stamp: '', lines: ['He bathes in blood, he grows with every kill,', 'He’s stronger now, and I am standing still,', 'The fire I made, it feeds him more,', 'The pig still stands,', 'This is not the final score'] },
  { id: 'outro', t: 268.3, v: 0.3, motes: 'ash', stamp: '', lines: ['I’m going down,', 'I’m almost gone,', 'The fight is not,', 'The fight’s not won', 'Alaron…', 'Alaron…', 'Alaron…'] },
  { id: 'final', t: 291.0, v: 0.1, motes: 'ash', stamp: '', lines: [] }
];
const LINE_TIMES = [68.04, 71.5, 74.48, 78.24, 81.54, 84.22, 87.08, 90.44, 93.32, 96.18, 99.12, 103.1,
  108.54, 112.18, 115, 118.22, 120.94, 124,
  138.94, 141.92, 144.98, 147.74, 151.02, 153.96, 156.82, 159.9,
  162.9, 165.96, 168.84, 171.94,
  176.26, 179.64, 182.46, 185.52, 188.38, 191.54,
  218.4, 222.08, 225.69, 228.18, 236.08, 242.42, 244.8,
  249.12, 252.16, 255.14, 258.06, 260.38,
  268.76, 271, 273.98, 276.88, 281.86, 284.88, 287.84];
const BEATS = {"bpm":79.99,"beats":[0.19,0.86,1.62,2.42,3.12,3.81,4.22,4.66,5.39,6.05,6.82,7.76,8.16,8.78,9.52,10.21,11.15,11.74,12.4,12.91,13.6,14.54,15.28,16.05,16.82,17.6,18.27,19.01,19.55,20.11,20.67,21.28,21.87,22.38,23.09,23.89,24.67,25.52,26.38,27.06,27.68,28.37,29.12,29.73,30.51,31.3,31.94,32.45,32.85,33.62,34.38,34.99,35.52,36.03,36.69,37.42,37.82,38.58,38.98,39.71,40.3,40.86,41.6,42.0,42.74,43.54,44.27,45.01,45.79,46.54,47.3,48.06,48.82,49.22,49.95,50.35,51.07,51.79,52.56,53.31,54.05,54.78,55.42,55.9,56.58,57.14,57.76,58.53,59.26,60.02,60.51,61.5,62.26,63.01,63.74,64.5,65.25,66.0,66.74,67.49,68.24,68.99,69.47,70.02,70.48,71.22,71.86,72.72,73.25,74.05,74.77,75.71,76.27,77.02,77.79,78.27,78.67,79.46,79.98,80.4,80.94,81.68,82.45,82.99,83.94,84.51,85.36,85.97,86.56,87.1,87.7,88.43,89.06,89.7,90.53,91.25,92.02,92.94,93.7,94.45,95.2,95.95,96.7,97.44,98.19,98.77,99.23,99.7,100.45,101.2,101.7,102.22,102.7,103.46,104.18,104.72,105.14,105.73,106.51,107.41,108.02,108.67,109.44,110.18,110.85,111.66,112.4,113.17,113.92,114.67,115.42,116.16,116.91,117.6,118.43,119.17,119.92,120.67,121.42,122.16,122.88,123.66,124.34,125.17,125.9,126.64,127.42,128.16,128.91,129.66,130.42,131.17,131.9,132.53,133.04,133.66,134.16,134.91,135.65,136.05,136.67,137.15,137.9,138.66,139.41,140.11,140.91,141.66,142.42,143.14,143.92,144.67,145.38,145.79,146.74,147.17,147.66,148.4,149.17,149.9,150.66,151.41,152.16,152.91,153.66,154.42,155.01,155.9,156.51,157.22,157.76,158.16,158.9,159.66,160.42,161.17,161.9,162.67,163.41,163.94,164.38,164.91,165.66,166.42,167.14,167.9,168.53,169.04,169.79,170.54,171.28,172.05,172.78,173.54,174.29,175.04,175.79,176.51,176.93,177.66,178.38,179.17,179.9,180.66,181.41,182.16,182.91,183.66,184.42,185.17,185.92,186.67,187.41,188.16,188.91,189.66,190.38,191.17,191.92,192.67,193.6,194.14,194.93,195.66,196.43,197.17,197.79,198.3,199.04,199.79,200.4,200.93,201.66,202.42,203.17,203.92,204.66,205.41,206.16,206.78,207.26,207.66,208.42,209.17,209.9,210.66,211.3,212.16,212.8,213.28,213.74,214.42,215.17,215.92,216.67,217.42,218.18,218.91,219.66,220.61,221.12,221.68,222.66,223.23,223.7,224.16,224.72,225.66,226.1,226.77,227.42,228.13,228.66,229.41,230.03,230.51,231.12,231.63,232.42,233.17,233.92,234.67,235.42,236.18,236.66,237.47,238.03,238.43,239.17,239.92,240.58,241.42,242.18,243.01,243.54,244.27,245.17,245.92,246.56,247.44,248.1,248.67,249.26,249.94,250.35,250.96,251.87,252.43,253.41,254.16,254.83,255.65,256.42,256.99,257.44,257.9,258.64,259.41,260.16,260.91,261.46,262.03,262.77,263.17,263.92,264.66,265.41,266.16,266.91,267.66,268.42,269.15,269.89,270.66,271.41,272.16,272.91,273.66,274.42,275.15,275.9,276.66,277.41,278.16,278.91,279.5,280.03,280.78,281.54,282.29,282.88,283.41,284.16,284.91,285.66,286.42,287.15,287.9,288.66,289.41,290.16,290.91,291.66,292.42,293.15,293.66,294.16,294.66,295.06,295.81,296.54,297.28,298.03,298.43,298.83,299.25,299.81,300.51,301.15,301.81,302.56,303.31,304.08,304.83,305.63,306.4,307.2],"bars":[0.19,3.12,5.39,8.16,11.15,13.6,16.82,19.55,21.87,24.67,27.68,30.51,32.85,35.52,37.82,40.3,42.74,45.79,48.82,51.07,54.05,56.58,59.26,62.26,65.25,68.24,70.48,73.25,76.27,78.67,80.94,83.94,86.56,89.06,92.02,95.2,98.19,100.45,102.7,105.14,108.02,110.85,113.92,116.91,119.92,122.88,125.9,128.91,131.9,134.16,136.67,139.41,142.42,145.38,147.66,150.66,153.66,156.51,158.9,161.9,164.38,167.14,169.79,172.78,175.79,178.38,181.41,184.42,187.41,190.38,193.6,196.43,199.04,201.66,204.66,207.26,209.9,212.8,215.17,218.18,221.12,223.7,226.1,228.66,231.12,233.92,236.66,239.17,242.18,245.17,248.1,250.35,253.41,256.42,258.64,261.46,263.92,266.91,269.89,272.91,275.9,278.91,281.54,284.16,287.15,290.16,293.15,295.06,298.03,299.81,302.56,305.63],"hits":[30.51,35.9,51.07,55.42,55.9,60.02,62.26,63.74,66.74,74.77,79.98,82.99,88.43,101.7,104.72,149.9,172.78,194.14,199.04,199.79,200.78,201.28,203.17,203.92,204.66,205.41,206.16,206.91,209.17,209.9,210.66,212.16,213.28,220.61,222.66,225.66,226.1,228.66,230.03,231.63,235.42,237.47,240.58,249.26,251.87,254.16,254.83,256.42,257.17,258.64,259.41,262.77,280.03,283.41,284.16,287.15,287.9,289.41,290.16,290.91,292.03,293.15,293.66,295.42,296.54,297.28,299.25,299.81,300.51,301.81,302.56,303.31,304.45]};

C.defineMood('grove', 0x0c1416, 0.03, 0x03060a, 0x10222a, 0x6a8a98, 0x0c1418, 0.7, 0xa8c8d8, 0.5, 0xb0ffe0, 1.3, 0x10181c, 1, 1, 0.4, 0x50ffc0, 0x80d0ff);
C.defineMood('cave', 0x0c0a0e, 0.03, 0x020203, 0x0c0a0e, 0x9a90b0, 0x1c1618, 1.0, 0x9088b0, 0.4, 0xffb070, 2.3, 0x24201e, 0, 0, 0);
C.defineMood('lair', 0x1c0a08, 0.026, 0x080202, 0x2a0a06, 0xc06848, 0x2a100a, 0.95, 0xff8050, 0.55, 0xff8a40, 2.2, 0x281410, 0, 0, 0);
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 26.5, m: 'outside', b: 3 }, { t: 54, m: 'cross', b: 4 }, { t: 71.4, m: 'grove', b: 3 },
  { t: 108, m: 'camp', b: 3 }, { t: 128, m: 'outside', b: 4 }, { t: 145, m: 'cross', b: 3 }, { t: 150.2, m: 'cave', b: 2 },
  { t: 196, m: 'cave', b: 1 }, { t: 207, m: 'lair', b: 6 }, { t: 219.4, m: 'flash', b: 0.15 }, { t: 220.0, m: 'lair', b: 1.5 },
  { t: 249, m: 'crater', b: 3 }, { t: 269, m: 'wellRed', b: 0.6 }, { t: 271.5, m: 'crater', b: 2 }, { t: 281, m: 'black', b: 9 }
];
const TITLES = [
  { t: 74.6, name: 'Severin', sub: 'real as blood, real as bone' },
  { t: 147.9, name: 'The Pig', sub: 'the butcher in the deep' },
  { t: 151.2, name: 'A blood troll', sub: '', dur: 2.6 },
  { t: 166.1, name: 'The druids', sub: 'they wear any shape they want' }
];

/* ---- art helpers ---- */
const tileMat = () => new THREE.MeshLambertMaterial({ color: 0x8a8478, map: C.tex('castle_brick_07_diff', 1, 1) || null });
function hole(r) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; return m; }
// a pile of old bones
function bones(n, rr) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = R(0, TAU), r = R(0, rr), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i % 5 === 0) P.push(ic(0.11, 1, 0xd8ccb0, [x, 0.1, z], [1, 0.85, 1.15]), bx(0.12, 0.04, 0.06, 0x2a2420, [x, 0.08, z + 0.09]));
    else P.push(cy(0.025, 0.03, R(0.3, 0.55), 4, 0xd0c4a8, [x, 0.04, z], [Math.PI / 2, R(0, TAU), 0]));
  }
  return solid(P);
}
// Lucien playing the lute, sitting
function lutePlayer(ch) {
  const lu = ch.lucien({ pose: 'Sitting_Idle_Loop' }); lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
  const lute = C.creature('lute', { h: 0.85 }); if (lute) C.attach(lu, 'spine_03', lute, [0.05, -0.05, 0.22], [0.3, 0, 1.15]);
  return lu;
}

const SCENES = [
  /* ---- the night road out of town: the three of them on the hunt ---- */
  function road(X) {
    const S = X.sec.road, kit = C.kit(X), ch = chars(X), g = new THREE.Group();
    g.add(kit.trees(S.d0 - 6, S.d1 + 4, { minSide: 6.5, maxSide: 36, dens: 1.0, deadP: 0.25, tint: 0x8a96a8 }));
    const grp = new THREE.Group(); g.add(grp);
    const lu = ch.lucien({ pose: 'Walk_Loop' }), art = ch.arthas({ pose: 'Walk_Loop' }), ced = ch.cedric({ pose: 'Walk_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    lu.position.set(0, 0, 0.6); art.position.set(-1.3, 0, -0.4); ced.position.set(1.3, 0, -0.3); [lu, art, ced].forEach((o) => grp.add(o));
    const torch = X.glow(0xffa040, 1.6, 0.9); torch.position.set(1.7, 2.1, -0.1); grp.add(torch);
    const d0 = S.d0 + 10, d1 = S.d1 - 6;
    grp.position.copy(X.at(d0, 0, 0));
    const act = C.act(grp, [{ t: 0, face: X.at(d0 + 5, 0, 0) }, { t: S.t0 - 0.5, to: railPts(X, d0, d1, 0), by: S.t1 - 1 }, { t: S.t1 - 1, pose: 'Idle_Loop', face: X.at(d1 + 5, 0, 0) }], { rigs: [lu, art, ced] });
    X.anchors.party = grp;
    return { group: g, d0: S.d0 - 6, d1: S.d1 + 4, vis: 100, update(t, ctx) { act.update(t, ctx); torch.material.opacity = 0.8 + 0.1 * Math.sin(ctx.time * 12); const p = grp.getWorldPosition(V3(0, 0, 0)); ctx.light(1, p.x, 2.2, p.z, 0xffa040, 1.8, 18); } };
  },

  /* ---- the city square at night: twelve bound in the middle, Lucien on a rooftop. He sees Severin in the crowd,
     runs the roof tiles and jumps down to her feet. Eight of the twelve are turning; he will not let them go her way. ---- */
  function citySquare(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), Lk = X.line;
    const SV = X.sec.v1, dSq = SV.d0 + 8;
    // the square's own frame: -z is ahead along the rail, +x to the right
    const CT = new THREE.Group(); CT.position.copy(X.at(dSq, 0, 0)); CT.rotation.y = X.yawAt(dSq); g.add(CT); CT.updateMatrixWorld(true);
    const W = (x, z) => CT.localToWorld(V3(x, 0, z));
    // houses round the square (the kit), cobbles, torches
    const hs = [[-13, -6, 1], [-13, 4, 1], [-12, 14, 1], [13, -9, -1], [12, 18, -1], [-4, -17, 0], [6, -18, 0], [-6, 22, 2]].map(([x, z, f]) => {
      const p = W(x, z), yaw = CT.rotation.y + (f === 1 ? Math.PI / 2 : f === -1 ? -Math.PI / 2 : f === 2 ? Math.PI : 0);
      return { x: p.x, z: p.z, yaw, w: 6, d: 6, st: 2, brick: (x + z) % 3 === 0 };
    });
    const vil = kit.village(hs); if (vil) g.add(vil);
    const cob = new THREE.Mesh(new THREE.PlaneGeometry(30, 46), new THREE.MeshLambertMaterial({ color: 0x8a7a6a, map: C.tex('cobblestone_floor_04_diff', 7, 10) || null }));
    cob.rotation.x = -Math.PI / 2; cob.position.set(0, 0.015, 2); CT.add(cob);
    const tl = [[-6, -8], [6, -8], [-7, 7], [-2, 12]].map(([x, z]) => { const p = W(x, z); return { x: p.x, z: p.z }; });
    const tor = kit.torches(tl, { glow: 0xffb060, size: 3.6, op: 0.9 }); g.add(tor.group);
    // the rooftop he starts on: a long house on the right, its roof of tiles
    const RX = 8.6, RH = 5.0, rf = [];
    rf.push(bx(6.4, RH, 7.4, 0x6a5a4a, [RX, RH / 2, 3.5]));
    for (let z = 0; z <= 7; z += 0.5) rf.push(bx(6.6, 0.1, 0.56, (z * 2) % 2 ? 0x7a3a2a : 0x6a3024, [RX, RH + 0.05, z], [0.12, 0, 0]));
    rf.push(bx(0.5, 1.6, 0.5, 0x4a3a32, [RX + 2.2, RH + 0.8, 5.6]));   // a chimney
    CT.add(solid(rf));
    const wl = []; for (let z = 1.5; z < 7; z += 3) wl.push(C.part(new THREE.PlaneGeometry(0.8, 1.0), 0xffb860, M([RX - 3.22, 2.6, z], [0, -Math.PI / 2, 0])));
    CT.add(C.emis(wl, { side: THREE.DoubleSide }));
    // the twelve, bound and kneeling round a post in the middle
    const center = V3(0, 0, 0), souls = [], dead = [], TURN = [0, 1, 3, 4, 6, 7, 9, 10];   // the eight who are turning
    CT.add(solid([cy(0.18, 0.2, 3.2, 8, 0x4a3424, [0, 1.6, 0]), cy(2.6, 2.6, 0.08, 20, 0x4a4440, [0, 0.04, 0])]));
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * TAU, p = V3(Math.cos(a) * 2.0, 0, Math.sin(a) * 2.0);
      const s = ch.person({ seed: 4100 + k * 7, outfit: 'peasant', pose: 'Fixing_Kneeling' }); s.position.copy(p); s.rotation.y = Math.atan2(p.x, p.z); s.userData.label = 'bound'; CT.add(s); souls.push(s);
      const rope = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 4, 12), new THREE.MeshLambertMaterial({ color: 0x8a7050 })); rope.rotation.x = Math.PI / 2; rope.position.set(p.x * 0.96, 0.62, p.z * 0.96); rope.scale.setScalar(0.85); CT.add(rope);
      const turning = TURN.includes(k);
      const e = X.glow(0xffb030, 0.25, 0); e.position.set(p.x * 1.08, 1.05, p.z * 1.08); CT.add(e); s.userData.eyeG = turning ? e : null;
      if (turning) { const body = lay(ch.person && ch.person({ bake: true, seed: 4100 + k * 7, outfit: 'peasant' })); if (body) { body.position.copy(p); body.rotation.y = a; body.visible = false; CT.add(body); dead.push({ body, s }); } }
    }
    // the crowd round the edge (frozen rigs, instanced), keeping clear of the roof and the landing
    const cr = [];
    for (let i = 0; i < (X.mobile ? 22 : 34); i++) { const a = R(0, TAU), r = R(5.2, 8.5), x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > 2.2 && z > -8) continue; cr.push({ x, z, yaw: Math.atan2(-x, -z) + R(-0.3, 0.3) }); }
    const baked = [];
    for (let k = 0; k < 4; k++) { const p = ch.person({ bake: true, seed: 4500 + k * 13 }); if (p.userData.mixer) baked.push(C.bakeRig(p, k % 2 ? 'Idle_Torch_Loop' : 'Idle_Loop', 0.2 + k * 0.3)); }
    baked.forEach((b, k) => { const mats = cr.filter((c, i) => i % baked.length === k).map((c) => { const p = W(c.x, c.z); return M([p.x, 0, p.z], [0, CT.rotation.y + c.yaw, 0], 1); }); const im = C.instObject(b, mats); if (im) g.add(im); });
    // Severin in the crowd, crowned; Lucien on the roof; the brothers among the people
    const sevP = V3(4.6, 0, -6.0), landP = V3(5.2, 0, -4.7);
    const sev = severin(X, ch, { crown: true }); sev.position.copy(sevP); CT.add(sev);
    const lu = ch.lucien({ pose: 'Idle_Loop' }); lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false; CT.add(lu);
    const roofA = V3(RX, RH + 0.1, 6.4), roofB = V3(RX - 1.2, RH + 0.1, 0.5);
    lu.position.copy(roofA);
    const art = ch.arthas({ pose: 'Idle_Loop' }), ced = ch.cedric({ pose: 'Idle_Loop' }); CT.add(art); CT.add(ced);
    art.position.set(-5.2, 0, -3.4); ced.position.set(-5.6, 0, 2.2);
    const runT = Lk(0, -0.1), jumpT = Lk(1, -1.4), holdT = Lk(9, -1.6), deathT = Lk(11, 0.4);
    const acts = [
      C.act(lu, [{ t: 0, pose: 'Idle_Loop', face: center }, { t: 62, pose: 'Idle_Loop', face: sevP },                  // he sees her
        { t: runT, to: [roofA, V3(RX - 0.5, RH + 0.1, 3.4), roofB], by: jumpT, air: true },                                // "I ran the tiles"
        { t: jumpT, to: landP, move: 1.3, air: true, y: (u) => 1.8 * Math.sin(Math.PI * u) },                          // "I fell through air"
        { t: jumpT + 1.2, pose: 'Crouch_Idle_Loop', face: sev },                                                       // "landed at her feet"
        { t: Lk(2, -0.5), pose: 'Idle_Loop', face: sev },
        { t: Lk(7, -0.2), pose: 'Idle_Loop', face: V3(8, 0, 6) },                                                      // "I would not follow that kind of star"
        { t: Lk(10, -0.6), to: V3(3.0, 0, -3.2), move: 1.6 }, { t: Lk(10, 1.0), pose: 'Spell_Simple_Idle_Loop', face: sev }], { ignoreGround: true }),   // between her and the innocent
      C.act(sev, [{ t: 0, pose: 'Idle_Loop', face: center }, { t: jumpT + 0.4, pose: 'Idle_Loop', face: landP }, { t: Lk(3), pose: 'Idle_Talking_Loop', face: landP },
        { t: Lk(4), pose: 'Spell_Simple_Idle_Loop', face: center }, { t: Lk(6), pose: 'Idle_Talking_Loop', face: lu }, { t: Lk(11, 1.4), show: false }]),
      C.act(art, [{ t: 0, face: center }, { t: holdT, to: V3(-2.6, 0, -1.6), move: 2.0 }, { t: holdT + 2.0, pose: 'Sword_Idle', face: center }]),   // "my brothers holding back the mark"
      C.act(ced, [{ t: 0, face: center }, { t: holdT + 0.3, to: V3(-2.8, 0, 1.6), move: 2.0 }, { t: holdT + 2.3, pose: 'Idle_Loop', face: center }])
    ];
    X.anchors.severin = sev; X.anchors.luGrove = lu; X.anchors.square = CT; X.anchors.arthasGrove = art;
    X.anchors.souls = new THREE.Object3D(); CT.add(X.anchors.souls);
    const sw = W(sevP.x, sevP.z);
    return {
      group: g, d0: X.sec.ruin.d0 - 10, d1: SV.d1 + 10, vis: 100,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx)); tor.update(ctx.time);
        souls.forEach((s, k) => { const e = s.userData.eyeG; if (e) e.material.opacity = t > Lk(5) && t < deathT + k * 0.1 ? 0.5 + 0.4 * Math.sin(ctx.time * 7 + k) : 0; });
        dead.forEach(({ body, s }, k) => { body.visible = t >= deathT + k * 0.15; s.visible = s.visible && !body.visible; });
        sev.userData.aura.material.opacity = 0.2 + 0.1 * Math.sin(ctx.time * 2.2);
        ctx.light(0, sw.x, 2.4, sw.z, 0x70ffc8, t > 60 ? 1.6 : 0.4, 16);
        const lp = lu.getWorldPosition(V3(0, 0, 0)); ctx.light(1, lp.x, lp.y + 1.8, lp.z, 0xb070ff, t > Lk(10, 1) && t < Lk(11, 3) ? 2.6 : 0, 12);
      }
    };
  },

  /* ---- eight pyres under the moon; Lucien plays them home ---- */
  function pyres(X) {
    const S = X.sec.chorus, kit = C.kit(X), ch = chars(X), g = new THREE.Group(), Lk = X.line;
    g.add(kit.trees(S.d0 - 6, S.d1 + 10, { minSide: 14, maxSide: 40, dens: 0.8, deadP: 0.2, tint: 0x8090a8 }));
    const dP = S.d0 + 8, fires = [], logs = [];
    for (let k = 0; k < 8; k++) {
      const p = X.at(dP + k * 1.6, 7.5 + Math.sin(k * 1.3) * 0.6, 0);
      for (let l = 0; l < 4; l++) logs.push(cy(0.07, 0.07, 1.5, 5, 0x3a2a1c, [p.x, 0.1 + l * 0.14, p.z], [Math.PI / 2, (l % 2) * Math.PI / 2, 0]));
      logs.push(bx(0.45, 0.22, 1.5, 0xc8c0b0, [p.x, 0.7, p.z], [0, X.yawAt(dP), 0]));   // the shroud
      const f = kit.fire({ scale: 0.7, size: 3 }); f.group.position.set(p.x, 0.5, p.z); g.add(f.group); fires.push(f);
    }
    g.add(solid(logs));
    const lu = lutePlayer(ch); lu.position.copy(X.at(dP + 5.6, 2.2, 0.0)); g.add(lu);
    put(g, 'Rock_Medium_2', X.at(dP + 5.6, 1.9, 0), 0, 0.45);
    const art = ch.arthas({ pose: 'Idle_Loop' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    art.position.copy(X.at(dP + 2.4, 3.6, 0)); ced.position.copy(X.at(dP + 9.4, 3.8, 0)); g.add(art); g.add(ced);
    const pyreC = X.at(dP + 5.6, 7.5, 0);
    const acts = [C.act(lu, [{ t: 0, pose: 'Sitting_Idle_Loop', face: pyreC }]), C.act(art, [{ t: 0, face: pyreC }]), C.act(ced, [{ t: 0, face: pyreC }])];
    // sparks rising to the moon
    const sparks = []; for (let k = 0; k < 24; k++) { const s = X.glow(0xffb050, 0.18, 0); g.add(s); sparks.push({ s, k: k % 8, ph: R(0, 1) }); }
    X.anchors.pyres = new THREE.Object3D(); X.anchors.pyres.position.copy(pyreC); g.add(X.anchors.pyres); X.anchors.luLute = lu;
    return {
      group: g, d0: S.d0 - 6, d1: S.d1 + 10, vis: 100,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx));
        fires.forEach((f, k) => { f.update(ctx.time + k); f.group.visible = t > Lk(13, -0.3) + k * 0.25 || t < Lk(12); });   // "eight small fires, eight small flames": lit one by one
        sparks.forEach(({ s, k, ph }) => { const f = fires[k].group, u = (ctx.time * 0.25 + ph) % 1; s.position.set(f.position.x + Math.sin(u * 9 + ph * 7) * 0.5, 1 + u * 9, f.position.z); s.material.opacity = f.visible && t > Lk(15, -0.5) ? 0.8 * (1 - u) : 0; });
        ctx.light(1, pyreC.x, 2, pyreC.z, 0xff9040, 2.8, 26);
      }
    };
  },

  /* ---- the frightened man; the cave under the cleansed tree ---- */
  function caveMouth(X) {
    const S = X.sec.v2, kit = C.kit(X), ch = chars(X), g = new THREE.Group(), Lk = X.line;
    const dM = X.distAt(Lk(18)) + 5, dC = X.distAt(Lk(22)) - 2;
    g.add(kit.trees(X.sec.inst.d0 - 4, dC - 8, { minSide: 8, maxSide: 36, dens: 1.0, deadP: 0.3, tint: 0x8a96a8 }));
    // the man on his knees by a hut, Lucien in his head
    const hp = X.at(dM + 2, 9, 0); const hut = kit.village([{ x: hp.x, z: hp.z, yaw: X.yawAt(dM) - Math.PI / 2, w: 4, d: 4, st: 1 }]); if (hut) g.add(hut);
    const man = ch.person({ seed: 5300, female: false, outfit: 'peasant', tint: 0x6a6450, pose: 'Fixing_Kneeling' }); man.position.copy(X.at(dM, 4.6, 0)); g.add(man); man.userData.label = 'frightened';
    const lu = ch.lucien({ pose: 'Spell_Simple_Idle_Loop' }), art = ch.arthas({ pose: 'Sword_Idle' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    lu.position.copy(X.at(dM - 1.4, 3.2, 0)); art.position.copy(X.at(dM + 1.2, 2.6, 0)); ced.position.copy(X.at(dM + 1.8, 6.4, 0)); [lu, art, ced].forEach((o) => g.add(o));
    const mind = X.glow(0xb070ff, 1.4, 0); g.add(mind);
    const shards = []; for (let k = 0; k < 14; k++) { const s = X.glow(0xe8f0ff, 0.16, 0); g.add(s); shards.push({ s, a: R(0, TAU), b: R(-0.6, 1), v: R(1, 2.4) }); }
    // the cleansed tree over the cave mouth, the cliff
    const tP = X.at(dC - 2, -6, 0); put(g, 'TwistedTree_1', tP, 0.6, 15);
    const motes = []; for (let k = 0; k < 16; k++) { const s = X.glow(0x9ad8ff, R(0.3, 0.6), 0.5); s.position.copy(tP.clone().add(V3(R(-4, 4), R(2, 12), R(-4, 4)))); g.add(s); motes.push(s); }
    const cliff = [];
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 6; k++) { const p = X.at(dC + R(-1, 2), s * (4.6 + k * 3.4), 0); cliff.push(ic(R(4, 6), 0, 0x4a4644, [p.x, R(3, 6), p.z], [1, 1.6, 1])); }
    const top = X.at(dC + 1, 0, 0); cliff.push(bx(12, 6, 6, 0x3a3634, [top.x, 9.4, top.z], [0, X.yawAt(dC), 0]));
    g.add(solid(cliff));
    // in they go
    const into = (o, sd, dt) => C.act(o, [{ t: 0, face: o === man ? lu : man }, { t: Lk(19, 1.5 + dt), to: railPts(X, dM, dC + 6, sd), by: Lk(22, -0.6) }, { t: Lk(22, -0.6), show: false }]);
    const acts = [C.act(man, [{ t: 0, pose: 'Fixing_Kneeling', face: lu }]), into(lu, 0.4, 0), into(art, -0.8, 0.4), into(ced, 1.2, 0.2)];
    X.anchors.man = man; X.anchors.luMan = lu; X.anchors.tree = new THREE.Object3D(); X.anchors.tree.position.copy(tP); g.add(X.anchors.tree);
    X.anchors.mouth = new THREE.Object3D(); X.anchors.mouth.position.copy(X.at(dC, 0, 0)); g.add(X.anchors.mouth);
    return {
      group: g, d0: X.sec.inst.d0 - 4, d1: dC + 8, vis: 100,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx));
        const mp = man.getWorldPosition(V3(0, 0, 0)), on = ss(Lk(18, 0.3), Lk(18, 1.2), t) * (1 - ss(Lk(20), Lk(20, 0.8), t));
        mind.position.set(mp.x, 1.3, mp.z); mind.material.opacity = on * (0.6 + 0.3 * Math.sin(ctx.time * 7));
        shards.forEach((o) => { const u = t - Lk(19, 0.6); o.s.material.opacity = u > 0 && u < 1.2 ? 0.9 * (1 - u / 1.2) : 0; o.s.position.set(mp.x + Math.cos(o.a) * u * o.v, 1.3 + o.b * u * o.v, mp.z + Math.sin(o.a) * u * o.v); });   // "his mind cracked open like broken glass"
        motes.forEach((s, k) => { s.material.opacity = 0.35 + 0.25 * Math.sin(ctx.time * 1.5 + k); });
        ctx.light(1, mp.x, 1.8, mp.z, 0xb070ff, 2.4 * on, 12);
        ctx.light(0, tP.x, 6, tP.z, 0x9ad8ff, 1.4, 24);
      }
    };
  },

  /* ---- the cave system: the blood troll, the bones, the carved dungeon, the druids at the gate, the eight candles ---- */
  function caves(X) {
    const ch = chars(X), g = new THREE.Group(), Lk = X.line;
    const dC = X.distAt(Lk(22)) - 2, dLair = X.distAt(205), dEnd = X.Dend + 40;
    const dK = X.distAt(217.9) + 34;  // the Pig's keep, at the bottom
    g.add(C.lib.cave(X, dC, dLair + 4, { w: 6, h: 7.5 }));
    // the bottom cavern: wide and high
    g.add(C.lib.cave(X, dLair - 2, dEnd, { w: 6, h: 7.5, wFn: (d) => 1 + 3.5 * ss(dLair, dLair + 14, d), hFn: (d) => 1 + 2.4 * ss(dLair, dLair + 16, d), fungus: 0xff7040 }));
    // torches along the passage
    const tl = []; for (let d = dC + 3; d < dLair; d += 6) { const p = X.at(d, (Math.round(d) % 2 ? 1 : -1) * 4.8, 0); tl.push({ x: p.x, z: p.z }); }
    const tor = C.kit(X).torches(tl, { glow: 0xffa050, size: 3, op: 0.85 }); g.add(tor.group);

    // the blood troll in the passage, felled
    const dT = X.distAt(Lk(22)) + 7, trollP = X.at(dT, 0.4, 0);
    const troll = C.lib.troll(X, { pose: 'Idle_Loop' }); C.lib.trollSkin(troll);
    const trollDead = lay(C.lib.troll(X, { bake: true }), 'Idle_Loop', 0.2); if (trollDead) { C.lib.trollSkin(trollDead); trollDead.position.copy(trollP); trollDead.rotation.y = X.yawAt(dT) + 1.3; trollDead.visible = false; g.add(trollDead); }
    if (troll) { troll.position.copy(trollP); g.add(troll); }
    const party = new THREE.Group(); g.add(party);
    const lu = ch.lucien({ pose: 'Idle_Loop' }), art = ch.arthas({ pose: 'Sword_Idle' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    [lu, art, ced].forEach((o) => g.add(o));
    lu.position.copy(X.at(dC + 4, 0.2, 0)); art.position.copy(X.at(dC + 4.6, -1.3, 0)); ced.position.copy(X.at(dC + 4.2, 1.5, 0));
    const fellT = Lk(22, 1.6);
    // bones, then the carved dungeon: brick walls, pillars, arches
    const dB = X.distAt(Lk(23)) + 6, dD0 = X.distAt(Lk(24)) + 2, dD1 = X.distAt(Lk(26)) + 10;
    [-2.6, 2.8, -3.6, 3.2].forEach((s, k) => { const b = bones(26, 1.0); b.position.copy(X.at(dB + k * 1.8, s, 0)); g.add(b); });
    const brick = new THREE.MeshLambertMaterial({ color: 0x9a948a, map: C.tex('castle_brick_07_diff', 2, 1.5) || null, side: THREE.DoubleSide });
    for (let d = dD0; d < dD1; d += 4) {
      const yaw = X.yawAt(d + 2);
      [-1, 1].forEach((s) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 5), brick); w.position.copy(X.at(d + 2, s * 3.6, 2.5)); w.rotation.y = yaw + Math.PI / 2; g.add(w); });
      const pa = X.at(d, -3.2, 0), pb = X.at(d, 3.2, 0), arch = X.at(d, 0, 0);
      g.add(solid([bx(0.7, 4.6, 0.7, 0x8a847a, [pa.x, 2.3, pa.z], [0, yaw, 0]), bx(0.7, 4.6, 0.7, 0x8a847a, [pb.x, 2.3, pb.z], [0, yaw, 0]), bx(7.2, 0.6, 0.8, 0x7a746a, [arch.x, 4.9, arch.z], [0, yaw, 0])]));
    }
    // the gate and the two druids
    const dGt = X.distAt(Lk(27)) + 6, gp = X.at(dGt, 0, 0), gyaw = X.yawAt(dGt);
    const bars = []; for (let i = -6; i <= 6; i++) bars.push(cy(0.04, 0.04, 4.2, 5, 0x3a3a40, [i * 0.28, 2.1, 0])); bars.push(bx(3.8, 0.15, 0.15, 0x3a3a40, [0, 3.9, 0]), bx(3.8, 0.15, 0.15, 0x3a3a40, [0, 0.4, 0]));
    const port = solid(bars); const gate = new THREE.Group(); gate.position.copy(gp); gate.rotation.y = gyaw; gate.add(port); g.add(gate);
    gate.add(solid([bx(1.2, 5.2, 1.2, 0x8a847a, [-2.5, 2.6, 0]), bx(1.2, 5.2, 1.2, 0x8a847a, [2.5, 2.6, 0]), bx(6.2, 1.0, 1.3, 0x7a746a, [0, 5.4, 0])]));
    const dru = [-1, 1].map((s) => { const d = C.lib.druid(X, { pose: 'Idle_Loop' }) || ch.person({ seed: 77 + s, tint: 0x1a2016 }); d.position.copy(X.at(dGt - 1.6, s * 1.6, 0)); g.add(d); return d; });
    const wolves = [-1, 1].map((s) => { const w = C.creature('wolf', { h: 1.0, tint: 0x2a3020, eyes: 0x80ff60 }); if (w) { w.userData.label = 'druid-wolf'; X.anims.push(w); w.position.copy(X.at(dGt - 1.6, s * 1.6, 0)); g.add(w); } return w; });
    // Lucien in the Pig's face
    const disguise = C.lib.pig(X, { h: 2.4, pose: 'Walk_Loop' });
    if (disguise) { disguise.userData.label = 'lucien-as-pig'; g.add(disguise); disguise.position.copy(X.at(dGt - 9, 0.3, 0)); }
    const swirl = X.glow(0xb070ff, 3, 0); g.add(swirl);
    const faceT = Lk(26, -0.2), turnT = Lk(27), shiftT = Lk(28, 0.4), slipT = Lk(29, 0.2);
    // the eight candles in a carved alcove (chorus 2)
    const dA = X.sec.chorus2.d0 + 7, ap = X.at(dA + 0.4, 0.9, 0), ayaw = X.yawAt(dA);
    const alc = new THREE.Group(); alc.position.copy(ap); alc.rotation.y = ayaw - Math.PI / 2; g.add(alc);
    alc.add(solid([cy(1.9, 2.0, 0.06, 16, 0x5a5450, [0, 0.03, 0])]));   // a flat stone on the floor, the candles in an arc
    const flames = []; for (let k = 0; k < 8; k++) { const a = -1.1 + k * 0.314, x = Math.sin(a) * 1.3, z = -Math.cos(a) * 1.3 + 1.0; put(alc, 'Candle_1', V3(x, 0.06, z), 0, 0.26); const f = X.glow(0xffc070, 0.5, 0); f.position.set(x, 0.42, z); alc.add(f); flames.push(f); }
    const luC = lutePlayer(ch); luC.position.copy(X.at(dA + 0.4, -0.7, 0)); g.add(luC);
    const candleT = Lk(31, -0.3);

    const acts = [
      troll && C.act(troll, [{ t: 0, face: X.at(dC, 0, 0) }, { t: Lk(22, -0.6), pose: 'Sword_Idle', face: X.at(dC, 0, 0) }, { t: fellT, show: false }]),
      C.act(lu, [{ t: 0, show: false }, { t: Lk(22, -1.4), show: true, face: trollP }, { t: Lk(22, -1.3), to: X.at(dT - 5.5, 0.4, 0), move: 1.3 }, { t: Lk(22, 0), pose: 'Spell_Simple_Idle_Loop', face: trollP },
        { t: Lk(23, 0.2), to: railPts(X, dT - 5.5, dGt - 9, 0.3), by: faceT - 0.3 },
        { t: faceT, show: false }]),                                                                                      // "I wore his face"
      C.act(art, [{ t: 0, show: false }, { t: Lk(22, -1.4), show: true, face: trollP }, { t: Lk(22, -1.3), to: X.at(dT - 1.5, -0.6, 0), move: 1.2 }, { t: Lk(22, 0), pose: 'Sword_Idle', face: trollP },
        { t: Lk(23, 0.4), to: railPts(X, dT - 1.5, dGt - 4.5, -1.3), by: Lk(27, 1.2) }, { t: Lk(27, 1.2), pose: 'Idle_Loop', face: gp },
        { t: slipT + 0.4, to: railPts(X, dGt - 4.5, dGt + 10, -0.8), speed: 1.4 }, { t: X.sec.chorus2.t0 - 1, show: false }]),
      C.act(ced, [{ t: 0, show: false }, { t: Lk(22, -1.4), show: true, face: trollP }, { t: Lk(22, -1.3), to: X.at(dT - 2.2, 1.6, 0), move: 1.2 }, { t: Lk(22, 0.2), pose: 'Idle_Loop', face: trollP },
        { t: Lk(23, 0.6), to: railPts(X, dT - 2.2, dGt - 4.8, 1.3), by: Lk(27, 1.4) }, { t: Lk(27, 1.4), pose: 'Idle_Loop', face: gp },
        { t: slipT + 0.6, to: railPts(X, dGt - 4.8, dGt + 10, 0.8), speed: 1.4 }, { t: X.sec.chorus2.t0 - 1, show: false }]),
      disguise && C.act(disguise, [{ t: 0, show: false }, { t: faceT, show: true, pose: 'Idle_Loop', face: gp }, { t: faceT + 0.6, to: railPts(X, dGt - 9, dGt - 3.2, 0.3), by: Lk(27, 0.4) },   // walks up to the gate in his face
        { t: Lk(27, 0.4), pose: 'Idle_Talking_Loop', face: gp }, { t: slipT, to: railPts(X, dGt - 3.2, dGt + 9, 0), speed: 1.3 }, { t: X.sec.chorus2.t0 - 1, show: false }]),
      ...dru.map((d, i) => C.act(d, [{ t: 0, face: X.at(dGt - 8, 0, 0) }, { t: turnT, to: [X.at(dGt - 1.2, (i ? 1 : -1) * 3.2, 0), X.at(dGt + 0.6, (i ? 1 : -1) * 4.4, 0)], move: 2.6 },   // "turned and walked away"
        { t: shiftT, show: false }])),
      ...wolves.filter(Boolean).map((w, i) => C.act(w, [{ t: 0, show: false }, { t: shiftT, show: true, pose: 'Idle', face: X.at(dGt + 9, 0, 0) }, { t: shiftT + 0.3, pose: 'Idle', face: X.at(dGt - 9, 0, 0) },   // "they chose their shape"
        { t: Lk(29, -0.4), to: railPts(X, dGt - 2.6, dGt - 22, (i ? 1 : -1) * 2.2), speed: 4.2 }, { t: Lk(29, 4), show: false }], { gait: [['Walk', 0.69], ['Gallop', 2.57]], idle: 'Idle' })),   // "I sent them out"
      C.act(luC, [{ t: 0, show: false }, { t: X.sec.chorus2.t0 - 0.5, show: true, pose: 'Sitting_Idle_Loop', face: ap }, { t: X.sec.deep.t0, show: false }])
    ].filter(Boolean);
    X.anchors.troll = troll || lu; X.anchors.trollDead = trollDead || lu; X.anchors.luCave = lu; X.anchors.arthasCave = art; X.anchors.cedricCave = ced;
    X.anchors.bones = new THREE.Object3D(); X.anchors.bones.position.copy(X.at(dB + 2, 0, 0)); g.add(X.anchors.bones);
    X.anchors.dungeon = new THREE.Object3D(); X.anchors.dungeon.position.copy(X.at(dD0 + 6, 0, 0)); g.add(X.anchors.dungeon);
    X.anchors.gate = gate; X.anchors.disguise = disguise || lu; X.anchors.druid0 = dru[0]; X.anchors.druid1 = dru[1]; X.anchors.candles = alc; X.anchors.luCandle = luC;
    X.dGate = dGt; X.dDungeon = dD0;
    return {
      group: g, d0: dC - 10, d1: dLair + 10, vis: 120,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx)); tor.update(ctx.time);
        if (trollDead) trollDead.visible = t >= fellT;
        const sw = Math.max(0, 1 - Math.abs(t - faceT) / 0.7) + Math.max(0, 1 - Math.abs(t - shiftT) / 0.6) * 0.8;
        const sp = t < shiftT - 1 ? (disguise || lu).getWorldPosition(V3(0, 0, 0)) : gp;
        swirl.position.set(sp.x, 1.4, sp.z); swirl.material.opacity = 0.9 * sw;
        port.position.y = 3.6 * ss(slipT - 0.6, slipT + 1.0, t);   // the portcullis goes up
        flames.forEach((f, k) => { f.material.opacity = t > candleT + k * 0.3 ? 0.75 + 0.15 * Math.sin(ctx.time * 9 + k) : 0; });
        ctx.light(1, sp.x, 2.2, sp.z, 0xb070ff, 3 * sw, 14);
        if (t > X.sec.chorus2.t0 - 1 && t < X.sec.deep.t0 + 1) ctx.light(0, ap.x, 1.6, ap.z, 0xffc070, 1.8, 14);
        else if (t > fellT - 2 && t < fellT + 2) ctx.light(0, trollP.x, 2, trollP.z, 0xff3020, 2.2, 14);
      }
    };
  },

  /* ---- the Pig's keep in the bottom cavern; the fireball through the window; the Pig grows; Lucien falls ---- */
  function keep(X) {
    const ch = chars(X), g = new THREE.Group(), Lk = X.line;
    const dK = X.distAt(217.9) + 34, kp = X.at(dK, 0, 0), kyaw = X.yawAt(dK);
    // the keep, built of cut stone, a lit window up high (the room behind it: the Pig and his prisoners), a door below
    const K = new THREE.Group(); K.position.copy(kp); K.rotation.y = kyaw + Math.PI; g.add(K); K.updateMatrixWorld(true);    // local -z faces the party (back up the rail)
    const brick = new THREE.MeshLambertMaterial({ color: 0x8a8076, map: C.tex('castle_brick_07_diff', 3, 3) || null });
    const B = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brick); m.position.set(x, y, z); K.add(m); return m; };
    // front wall with a window hole (x -1.6..1.6, y 4.4..6.6) and a door (x -1.4..1.4, y 0..3.2)
    B(5.6, 10, 1, -4.4, 5, -3); B(5.6, 10, 1, 4.4, 5, -3); B(3.2, 1.2, 1, 0, 3.8, -3); B(3.2, 3.4, 1, 0, 8.3, -3);
    B(1, 10, 9, -6.7, 5, 1.5); B(1, 10, 9, 6.7, 5, 1.5); B(14.4, 10, 1, 0, 5, 6);
    B(14.4, 0.4, 9, 0, 4.4, 1.5);                                              // the upper floor
    K.add(solid([cn(1.2, 3, 4, 0x3a2420, [-5.6, 11.5, -2], [0, Math.PI / 4, 0]), cn(1.2, 3, 4, 0x3a2420, [5.6, 11.5, -2], [0, Math.PI / 4, 0]), bx(15, 0.6, 10, 0x4a3a30, [0, 10.2, 1.5])]));
    for (let i = -6; i <= 6; i += 2) K.add(solid([bx(0.9, 1.0, 1.1, 0x7a7068, [i, 10.9, -3])]));
    const doorM = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), new THREE.MeshLambertMaterial({ color: 0x2a1a12, side: THREE.DoubleSide })); doorM.position.set(0, 1.6, -3.45); K.add(doorM);
    const winGlow = X.glow(0xffb060, 6, 0.8); winGlow.position.set(0, 5.6, -2); K.add(winGlow);
    const roomL = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), new THREE.MeshBasicMaterial({ color: 0x5a3018 })); roomL.position.set(0, 7, 5.4); roomL.rotation.y = Math.PI; K.add(roomL);
    // meat hooks and chains hanging from beams outside, torches either side of the door
    const hooks = []; for (let i = 0; i < 5; i++) { const x = -5 + i * 2.5, z = -6.5 - (i % 2) * 1.2; hooks.push(cy(0.02, 0.02, 3, 4, 0x3a3a40, [x, 6.8, z]), cy(0.28, 0.2, 1.3, 6, 0x6a2020, [x, 4.7, z]), cy(0.12, 0.12, 0.3, 5, 0xd8ccb0, [x, 4.0, z])); }
    hooks.push(bx(13, 0.3, 0.3, 0x3a2a1c, [0, 8.3, -6.8]), bx(0.3, 8.3, 0.3, 0x3a2a1c, [-6.4, 4.15, -6.8]), bx(0.3, 8.3, 0.3, 0x3a2a1c, [6.4, 4.15, -6.8]));
    K.add(solid(hooks));
    const tor = C.kit(X).torches([[-2.2, -3.6], [2.2, -3.6]].map(([x, z]) => { const p = K.localToWorld(V3(x, 0, z)); return { x: p.x, z: p.z }; }), { glow: 0xffa040, size: 3.5, op: 0.9 }); g.add(tor.group);
    // inside the window: the Pig, and prisoners kneeling in chains
    const pig = C.lib.pig(X, { pose: 'Idle_Loop' });
    const prisoners = []; for (let k = 0; k < 4; k++) { const p = ch.person({ seed: 6100 + k * 9, outfit: 'peasant', pose: 'Fixing_Kneeling' }); p.position.set(-3 + k * 2, 4.6, 1.2 + (k % 2)); p.rotation.y = Math.PI + R(-0.4, 0.4); p.userData.label = 'prisoner'; K.add(p); prisoners.push(p); }
    const roomFire = []; for (let k = 0; k < 7; k++) { const f = X.glow(0xff7020, R(1.5, 3), 0); f.position.set(R(-5, 5), R(5, 7.5), R(-1.5, 4)); K.add(f); roomFire.push(f); }
    // the party, at the edge of the bottom cavern
    const dS = dK - 17, lu = ch.lucien({ pose: 'Idle_Loop' }), art = ch.arthas({ pose: 'Sword_Idle' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    [lu, art, ced].forEach((o) => g.add(o));
    lu.position.copy(X.at(dS - 14, 0, 0)); art.position.copy(X.at(dS - 15, -1.4, 0)); ced.position.copy(X.at(dS - 15, 1.4, 0));
    const fireball = X.glow(0xff8a30, 1.6, 0), fbCore = X.glow(0xfff0b0, 0.6, 0); g.add(fireball); g.add(fbCore);
    const boom = X.glow(0xffa040, 18, 0); boom.position.copy(K.localToWorld(V3(0, 5.6, -3.2))); g.add(boom);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), new THREE.MeshBasicMaterial({ color: 0x5a0606, transparent: true, opacity: 0 })); pool.rotation.x = -Math.PI / 2; pool.position.copy(X.at(dK - 8, 0, 0.035)); g.add(pool);
    const feed = []; for (let k = 0; k < 12; k++) { const s = X.glow(0xff7a20, 0.9, 0); g.add(s); feed.push({ s, a: R(0, TAU), r: R(4, 9), h: R(1, 6) }); }
    const throwT = Lk(36, -0.3), hitT = Lk(36, 1.0), outT = Lk(43, -1.5), poolP = X.at(dK - 8, 0, 0), luS = X.at(dS, 0, 0);
    const winLocal = V3(0, 4.6, -1.6), winP = K.localToWorld(winLocal.clone());
    if (pig) { pig.position.copy(winLocal); pig.rotation.y = Math.PI; K.add(pig); }
    // the Pig out of the door, into the blood (a second rig at ground level, so the window one can stay in the room)
    const pigOut = C.lib.pig(X, { pose: 'Idle_Loop' }); if (pigOut) { pigOut.position.copy(K.localToWorld(V3(0, 0, -1.5))); g.add(pigOut); }
    const fallen = lay(ch.lucien({ bake: true, pose: 'Idle_Loop' }), 'Idle_Loop', 0.1); if (fallen) { fallen.position.copy(X.at(dS - 3.4, 0.3, 0)); fallen.rotation.y = kyaw + Math.PI; fallen.visible = false; g.add(fallen); }
    const goneT = Lk(48, 1.1);
    const acts = [
      C.act(lu, [{ t: 0, face: kp }, { t: 205, to: railPts(X, dS - 14, dS, 0), by: 215 }, { t: 215, pose: 'Idle_Loop', face: winP },
        { t: throwT, pose: 'Spell_Simple_Idle_Loop', face: winP },                                                        // "a window lit, I threw the flame"
        { t: Lk(37, 0.6), pose: 'Idle_Loop', face: winP }, { t: Lk(40, -0.3), pose: 'Fixing_Kneeling', face: winP },       // "a burden I will carry"
        { t: Lk(43, -0.4), pose: 'Idle_Loop', face: poolP },                                                              // "I am standing still"
        { t: Lk(47, 0), pose: 'Spell_Simple_Idle_Loop', face: poolP },
        { t: Lk(48, 0.5), to: X.at(dS - 3.0, 0, 0), move: 0.55, back: true }, { t: goneT, show: false }]),                // "I'm going down"
      C.act(art, [{ t: 0, face: kp }, { t: 205.2, to: railPts(X, dS - 15, dS - 1.6, -1.6), by: 215.5 }, { t: 215.5, pose: 'Sword_Idle', face: kp },
        { t: Lk(40, 1.0), pose: 'Idle_Loop', face: lu },
        { t: Lk(50, -0.6), to: X.at(dS - 0.6, -0.6, 0), move: 1.3 }, { t: Lk(50, 0.8), pose: 'Sword_Idle', face: poolP }]),    // "the fight is not won"
      C.act(ced, [{ t: 0, face: kp }, { t: 205.4, to: railPts(X, dS - 15, dS - 1.8, 1.6), by: 215.8 }, { t: 215.8, pose: 'Idle_Loop', face: kp },
        { t: Lk(51, -0.6), to: X.at(dS - 0.6, 0.8, 0), move: 1.3 }, { t: Lk(51, 0.8), pose: 'Sword_Idle', face: poolP }]),
      pig && C.act(pig, [{ t: 0, pose: 'Idle_Loop', face: K.localToWorld(V3(0, 4.6, -10)) }, { t: outT - 2, show: false }]),
      pigOut && C.act(pigOut, [{ t: 0, show: false }, { t: outT, show: true, face: luS }, { t: outT + 0.1, to: poolP, move: 3.6 },
        { t: Lk(43, 1), pose: 'Idle_Loop', face: luS, s: 1 },
        { t: Lk(43, 1.5), s: 1.18 }, { t: Lk(44, 0.5), s: 1.32 }, { t: Lk(45, 1.0), s: 1.45 },                          // "he grows with every kill"
        { t: Lk(47, -0.4), pose: 'Sword_Idle', face: luS },                                                             // "this is not the final score"
        { t: Lk(48, -2.2), to: X.at(dS + 2.6, 0, 0), move: 2.4 }, { t: Lk(48, 0.4), pose: 'Sword_Idle', face: lu }])
    ].filter(Boolean);
    X.anchors.keep = K; X.anchors.window = new THREE.Object3D(); X.anchors.window.position.copy(winP); g.add(X.anchors.window);
    X.anchors.pig = pig || K; X.anchors.pigOut = pigOut || K; X.anchors.luKeep = lu; X.anchors.arthasKeep = art; X.anchors.cedricKeep = ced; X.anchors.fallen = fallen || lu;
    X.anchors.pool = new THREE.Object3D(); X.anchors.pool.position.copy(poolP); g.add(X.anchors.pool);
    X.anchors.prisoner = prisoners[1] || K;
    return {
      group: g, d0: X.distAt(196) - 4, d1: X.Dend + 40, vis: 400,   // the Pig in his window shows up early ("waiting past that door")
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx)); tor.update(ctx.time);
        // the fireball: from Lucien's hand in an arc to the window
        const u = (t - throwT - 0.5) / (hitT - throwT - 0.5), hand = lu.getWorldPosition(V3(0, 0, 0)).add(V3(0, 1.5, 0));
        const fly = u > 0 && u < 1; fireball.material.opacity = fly ? 0.95 : 0; fbCore.material.opacity = fly ? 1 : 0;
        if (fly) { fireball.position.lerpVectors(hand, winP.clone().add(V3(0, 1.2, 0)), u); fireball.position.y += Math.sin(u * Math.PI) * 2.5; fbCore.position.copy(fireball.position); }
        const b = t - hitT; boom.material.opacity = b > 0 ? Math.max(0, 1 - b / 2.5) : 0;
        const burn = ss(hitT, hitT + 1, t) * (1 - ss(270, 285, t));
        roomFire.forEach((f, k) => { f.material.opacity = burn * (0.5 + 0.35 * Math.sin(ctx.time * 8 + k * 1.7)); });
        roomL.material.color.setHex(burn > 0.1 ? 0xb04010 : 0x5a3018); winGlow.material.opacity = 0.6 + 0.4 * burn;
        prisoners.forEach((p, k) => { p.visible = p.visible && t < hitT + 6 + k * 1.5; });
        pool.material.opacity = 0.9 * ss(outT + 1, outT + 4, t);
        const fp = (pigOut || K).getWorldPosition(V3(0, 0, 0));
        feed.forEach((o, k) => { const v = ((ctx.time * 0.5 + k / 12) % 1); const on = t > Lk(45, -0.3) && t < Lk(46, 1.5); o.s.material.opacity = on ? 0.9 * v : 0; const r = o.r * (1 - v); o.s.position.set(fp.x + Math.cos(o.a + v * 3) * r, 1.4 + o.h * (1 - v), fp.z + Math.sin(o.a + v * 3) * r); });   // "the fire I made, it feeds him more"
        if (fallen) fallen.visible = t >= goneT;
        const wp = winP; ctx.light(0, wp.x, wp.y + 1, wp.z, 0xff7a30, 2.2 + 3.5 * burn + 6 * Math.max(0, 1 - Math.abs(b) / 0.8), 40);
        ctx.light(1, fp.x, 2.4, fp.z, t > outT ? 0xff2a10 : 0xffa040, t > outT ? 2.8 : 1.4, 18);
      }
    };
  }
];

function clearings(X) {
  const c = (d, side, r) => { const p = X.at(d, side, 0); return { x: p.x, z: p.z, r }; }, S = X.sec;
  return [c(S.v1.d0 + 8, 0, 24), c(S.chorus.d0 + 13, 5, 9), c(X.distAt(X.line(18)) + 5, 3.5, 8), c(X.distAt(X.line(22)) - 4, -4, 7)];
}

function shots(X, D) {
  const A = X.anchors, H = X.hubAnchors, Lk = X.line, P = D.p, d = D.dAt;
  const wp = (o) => (o ? (o.isVector3 ? o.clone() : o.getWorldPosition(new THREE.Vector3())) : X.at(X.distAt(0) + 30, 0, 0));
  const near = (o, dx, dy, dz) => () => wp(o).add(V3(dx, dy, dz));
  const lu = H.lucien || V3(0, 0.45, -8.55), bros = () => (H.cedric ? wp(H.cedric) : V3(-2, 0, -4.6));
  const sq = (x, y, z) => () => A.square.localToWorld(V3(x, y, z)), kl = (x, y, z) => () => A.keep.localToWorld(V3(x, y, z)), cl = (x, y, z) => () => A.candles.localToWorld(V3(x, y, z));
  const dB = X.distAt(Lk(23)) + 6, dGt = X.distAt(Lk(27)) + 6, dA = X.sec.chorus2.d0 + 7;
  const S = X.sec, dK = X.distAt(217.9) + 34, dS = dK - 17;
  return [
    // the Blackbird, then out on the hunt
    { t: 0, cam: D.fixed(V3(0.4, 2.7, 3.6), V3(0, 1.6, -8.6), { push: 0.15, fov: 55 }) },
    { t: 6.0, cam: D.orbit(lu, { r: 3.2, h: 1.9, a0: 0.9, w: 0.07, t0: 6, lookH: 1.5, fov: 46 }) },
    { t: 13.6, cam: D.orbit(bros, { r: 2.8, h: 1.2, a0: 0.4, w: 0.1, t0: 13.6, lookH: 1.0, fov: 52 }) },
    { t: 19.6, cam: D.dolly(V3(0.6, 2.4, -6.6), V3(0, 2.0, -11.4), V3(0, 1.9, -16), { lookB: P(30, 0, 2), fov: 60, fov1: 72 }) },
    { t: 24.7, cam: D.track(A.party, { offset: [0.4, 1.7, 5.5], lookOffset: [0, 1.3, 0], fov: 55 }) },
    { t: 32.9, cam: D.orbit(A.party, { r: 6, h: 1.2, a0: 1.2, w: 0.1, t0: 32.9, lookH: 1.3, fov: 55 }) },
    { t: 40.3, cam: D.rail({ h: 7, ahead: 26, lookH: 0, fov: 62 }) },
    { t: 45.8, cam: D.track(A.party, { offset: [-2.4, 1.2, -3.0], lookOffset: [0, 1.2, 6], fov: 66 }) },
    { t: 51.1, cam: D.orbit(A.party, { r: 4, r1: 7, h: 2, h1: 5, a0: -0.6, w: 0.08, t0: 51.1, lookH: 1.2, fov: 58 }) },
    // the city square: the overview from the roof, her in the crowd, the run, the jump
    { t: 56.4, cam: D.dolly(sq(-3, 15, 24), sq(-2, 11, 15), sq(0, 0.5, 0), { fov: 56 }) },
    { t: 59.3, cam: D.fixed(sq(9.8, 7.2, 9.0), sq(0, 0.8, -1), { push: 0.12, fov: 52 }) },                                   // the overview, over his shoulder
    { t: 62.4, cam: D.fixed(sq(8.6, 9.6, 5.8), near(A.severin, 0, 1.5, 0), { push: 0.5, fov: 24 }) },                       // there she is
    { t: 65.3, cam: D.fixed(sq(11.4, 6.3, 4.4), near(A.luGrove, 0, 1.4, 0), { push: 0.2, fov: 48 }) },
    { t: Lk(0, -0.2), smooth: 1.6, cam: D.track(A.luGrove, { offset: [0.6, 1.4, 3.6], lookOffset: [0, 1.0, 0], fov: 58 }) },   // "I ran the tiles"
    { t: Lk(1, -1.5), cam: D.fixed(sq(1.8, 0.5, -9.4), sq(6.6, 3.6, -1.6), { fov: 62 }) },                                   // "I fell through air"
    { t: Lk(1, -0.1), cam: D.fixed(sq(1.4, 1.4, -9.0), () => wp(A.luGrove).lerp(wp(A.severin), 0.5).add(V3(0, 0.9, 0)), { push: 0.2, fov: 48 }) },   // "landed at her feet"
    { t: Lk(2, -0.2), cam: D.dolly(sq(2.6, 1.6, -8.4), sq(3.2, 1.65, -7.6), near(A.severin, 0, 1.5, 0), { fov: 42 }) },      // Severin
    { t: Lk(3, -0.2), cam: D.orbit(A.severin, { r: 3.4, h: 1.5, a0: 2.2, w: 0.08, t0: Lk(3), lookH: 1.4, fov: 48 }) },
    { t: Lk(4, -0.2), cam: D.orbit(A.souls, { r: 4.2, h: 3.2, a0: 0.4, w: 0.1, t0: Lk(4), lookH: 0.8, fov: 60 }) },          // "better let the dying go"
    { t: Lk(6, -0.2), cam: D.fixed(near(A.luGrove, -0.6, 1.7, -0.9), near(A.severin, 0, 1.6, 0), { push: 0.2, fov: 40 }) },   // "we're already dead"
    { t: Lk(7, -0.2), cam: D.fixed(sq(5.9, 1.7, -2.3), near(A.luGrove, 0, 1.55, 0), { push: 0.25, fov: 40 }) },               // "I would not follow"
    { t: Lk(8, -0.2), cam: D.orbit(A.souls, { r: 3.4, h: 2.2, a0: 1.0, w: 0.25, t0: Lk(8), lookH: 0.8, fov: 62 }) },        // eight souls turning
    { t: Lk(9, -0.2), cam: D.orbit(A.arthasGrove, { r: 2.6, h: 1.3, a0: 2.8, w: 0.1, t0: Lk(9), lookH: 1.3, fov: 52 }) },     // brothers holding back
    { t: Lk(10, -0.2), cam: D.fixed(sq(0.4, 1.8, -8.8), () => wp(A.luGrove).lerp(wp(A.severin), 0.5).add(V3(0, 1.4, 0)), { push: 0.2, fov: 48 }) },   // the innocent, not the crown
    { t: Lk(11, -0.2), cam: D.orbit(A.souls, { r: 6, r1: 12, h: 4, h1: 10, a0: 2.6, w: 0.05, t0: Lk(11), lookH: 0.3, fov: 58 }) },
    // the pyres
    { t: S.chorus.t0, cam: D.dolly(near(A.pyres, -9, 5, -9), near(A.pyres, -6, 2.4, -6), near(A.pyres, 0, 0.8, 0), { fov: 58 }) },
    { t: Lk(13, -0.3), cam: D.fixed(near(A.pyres, -3.5, 1.0, 3.0), near(A.pyres, 0, 0.6, 0), { push: 0.2, fov: 60 }) },    // eight small fires
    { t: Lk(14, -0.3), cam: D.orbit(A.luLute, { r: 2.6, h: 1.2, a0: 1.2, w: 0.08, t0: Lk(14), lookH: 1.0, fov: 46 }) },       // "a mournful tune"
    { t: Lk(15, -0.3), cam: D.orbit(A.pyres, { r: 10, r1: 16, h: 2, h1: 9, a0: 3.4, w: 0.04, t0: Lk(15), lookH: 4, fov: 62 }) },  // home beneath the moon
    { t: Lk(16, -0.3), cam: D.fixed(near(A.luLute, 1.6, 1.4, 1.6), near(A.luLute, 0, 1.0, 0), { push: 0.2, fov: 40 }) },
    { t: 128.0, cam: D.rail({ h: 2.4, ahead: 20, lookH: 1.4, fov: 66 }) },
    // the frightened man, the tree, the cave
    { t: Lk(18, -0.4), cam: D.orbit(A.man, { r: 3.4, h: 1.5, a0: 2.4, w: 0.1, t0: Lk(18), lookH: 1.0, fov: 50 }) },          // "we bled the truth"
    { t: Lk(19, -0.2), cam: D.fixed(near(A.luMan, 0.8, 1.6, 0.8), near(A.man, 0, 1.0, 0), { push: 0.3, fov: 40 }) },          // "his mind cracked open"
    { t: Lk(20, -0.3), cam: D.dolly(P(X.distAt(Lk(22)) - 20, 1.5, 2.4), P(X.distAt(Lk(22)) - 14, 0.5, 3.4), near(A.tree, 0, 6, 0), { fov: 62 }) },   // "the cave, the tree we'd cleansed"
    { t: Lk(21, -0.2), cam: D.fixed(kl(1.5, 6.0, -12), near(A.pig, 0, 1.8, 0), { push: 0.35, fov: 34 }) },                    // the Pig waiting past that door
    { t: Lk(22, -0.4), cam: D.fixed(P(X.distAt(Lk(22)) - 1.0, -0.9, 2.3), near(A.troll, 0, 2.6, 0), { push: 0.2, fov: 56 }) },          // the blood troll
    { t: Lk(22, 1.4), cam: D.fixed(near(A.trollDead, 2.6, 2.2, 2.6), near(A.trollDead, 0, 0.3, 0), { push: 0.15, fov: 52 }) },
    { t: Lk(23, -0.2), cam: D.fixed(P(dB - 4, 0.6, 1.7), near(A.bones, 0, 0.1, 0), { push: 0.2, fov: 56 }) },          // the bones
    { t: Lk(24, -0.3), cam: D.track(A.luCave, { offset: [0.6, 1.7, 3.6], lookOffset: [0, 1.4, 0], fov: 60 }) },                // the carved dungeon
    { t: Lk(25, -0.2), cam: D.dolly(near(A.dungeon, 0, 4.2, -4), near(A.dungeon, 0, 2.2, 4), near(A.dungeon, 0, 2.4, 16), { fov: 64 }) },  // "this was planned"
    { t: Lk(26, -0.4), cam: D.track(A.disguise, { offset: [0.4, 2.0, 3.6], lookOffset: [0, 1.8, 0], fov: 50 }) },       // "I wore his face"
    { t: Lk(27, -0.4), cam: D.fixed(P(dGt - 8.5, 1.6, 3.0), () => wp(A.druid0).lerp(wp(A.druid1), 0.5).add(V3(0, 1.5, 0)), { push: 0.2, fov: 50 }) },   // the druids turn away
    { t: Lk(28, -0.2), cam: D.fixed(P(dGt - 7.5, 1.4, 2.0), near(A.gate, 0, 1.4, 0), { push: 0.2, fov: 60 }) },           // "they chose their shape"
    { t: Lk(29, -0.2), smooth: 2, cam: D.track(A.disguise, { offset: [0.8, 2.2, -3.6], lookOffset: [0, 2, 6], fov: 60 }) },             // slipped the pen
    // eight candles
    { t: S.chorus2.t0, cam: D.dolly(P(dA - 6, 0.8, 1.8), P(dA - 3, -0.4, 1.4), cl(0, 1.0, 0), { fov: 52 }) },
    { t: Lk(31, -0.4), cam: D.fixed(P(dA + 3, 0.8, 1.4), cl(0, 1.1, 0), { push: 0.25, fov: 46 }) },
    { t: Lk(33, -0.3), cam: D.fixed(P(dA - 2.2, 1.2, 1.5), near(A.luCandle, 0, 1.0, 0), { push: 0.2, fov: 46 }) },
    { t: Lk(35, -0.3), cam: D.fixed(P(dA - 2.0, -1.4, 1.2), cl(0, 1.1, 0), { push: 0.3, fov: 50 }) },
    // the bottom of the cave
    { t: 196.0, cam: D.rail({ h: 4, ahead: 30, lookH: 3, fov: 64 }) },
    { t: 204.7, cam: D.dolly(P(dK - 42, 2, 12), P(dK - 30, -3, 8), kl(0, 5, 0), { fov: 60 }) },
    { t: 212.8, smooth: 2, cam: D.track(A.luKeep, { offset: [0.6, 1.8, -3.2], lookOffset: [0, 3, 10], fov: 56 }) },
    // the fireball
    { t: Lk(36, -0.6), cam: D.fixed(near(A.luKeep, -1.4, 1.7, 2.0), A.window, { fov: 52 }) },                                // "a window lit, I threw the flame"
    { t: Lk(36, 0.9), cam: D.fixed(kl(-6, 4.0, -16), kl(0, 5.6, -3), { push: 0.2, fov: 48 }) },
    { t: Lk(37, -0.2), cam: D.orbit(A.luKeep, { r: 2.2, h: 1.6, a0: 3.0, w: 0.08, t0: Lk(37), lookH: 1.6, fov: 42 }) },          // "I didn't know who bore the blame"
    { t: Lk(38, -0.2), cam: D.fixed(kl(1.2, 6.2, -5.5), near(A.prisoner, 0, 0.8, 0), { push: 0.2, fov: 46 }) },               // innocence burned
    { t: Lk(39, -0.2), cam: D.orbit(A.keep, { r: 24, h: 8, a0: 3.3, w: 0.05, t0: Lk(39), lookH: 5, fov: 56 }) },
    { t: Lk(40, -0.3), cam: D.orbit(A.luKeep, { r: 3.0, h: 1.0, a0: 0.4, w: 0.08, t0: Lk(40), lookH: 0.9, fov: 46 }) },          // a burden I will carry
    { t: Lk(41, -0.2), cam: D.fixed(near(A.luKeep, 0, 4.5, -4), near(A.luKeep, 0, 0.8, 0), { push: 0.2, fov: 50 }) },         // this will change me
    // the Pig
    { t: Lk(43, -1.6), cam: D.fixed(near(A.luKeep, 1.2, 1.2, -1.2), near(A.pigOut, 0, 2.2, 0), { fov: 56 }) },
    { t: Lk(43, 0.6), cam: D.orbit(A.pool, { r: 6, h: 0.6, a0: 3.4, w: 0.1, t0: Lk(43), lookH: 2.6, fov: 58 }) },             // he bathes in blood, he grows
    { t: Lk(44, -0.2), cam: D.fixed(near(A.luKeep, 0.5, 0.6, -1.0), near(A.pigOut, 0, 3.4, 0), { push: 0.15, fov: 56 }) },      // "I am standing still"
    { t: Lk(45, -0.2), cam: D.orbit(A.pigOut, { r: 7, h: 2.5, a0: 2.4, w: 0.1, t0: Lk(45), lookH: 2.8, fov: 58 }) },           // the fire feeds him
    { t: Lk(46, -0.2), cam: D.fixed(near(A.pool, 2.2, 0.3, -3.4), near(A.pigOut, 0, 3.8, 0), { push: 0.2, fov: 52 }) },        // "the pig still stands"
    { t: Lk(47, -0.2), cam: D.orbit(() => wp(A.pigOut).lerp(wp(A.luKeep), 0.5), { r: 8, h: 2.2, a0: 1.7, w: 0.06, t0: Lk(47), lookH: 2.0, fov: 56 }) },
    // the fall
    { t: Lk(48, -0.3), cam: D.fixed(P(dS - 5, 5.5, 2.4), () => wp(A.luKeep).lerp(wp(A.pigOut), 0.4).add(V3(0, 1.6, 0)), { fov: 56 }) },                             // "I'm going down"
    { t: Lk(49, -0.2), cam: D.fixed(near(A.fallen, 1.6, 0.7, 1.6), near(A.fallen, 0, 0.2, 0), { push: 0.3, fov: 46 }) },          // "almost gone"
    { t: Lk(50, -0.3), cam: D.fixed(P(dS - 6, 0.4, 0.5), near(A.arthasKeep, 0, 1.8, 0), { push: 0.15, fov: 52 }) },             // "the fight is not"
    { t: Lk(51, -0.2), cam: D.fixed(P(dS - 7, -2.6, 1.3), () => wp(A.arthasKeep).lerp(wp(A.cedricKeep), 0.5).add(V3(0, 1.6, 0)), { push: 0.15, fov: 54 }) },
    { t: Lk(52, -0.4), cam: D.dolly(near(A.fallen, 0, 3, 0), near(A.fallen, 0, 17, 0.5), near(A.fallen, 0, 0, 0), { fov: 50 }) }   // Alaron, Alaron, Alaron
  ];
}

C.levels[ID] = {
  session: 'Level 5 · Session recap · 21/06/2026',
  blurb: 'Twelve bound in the city square; Lucien runs the rooftops, drops at Severin’s feet and refuses her, and eight souls die. A frightened man gives up the cave under the cleansed tree; past a blood troll and a carved dungeon, Lucien wears the Pig’s own face past his druids. Then a lit window, a fireball, and the prisoners inside.',
  length: '5 min', audio: 'levels/05-' + ID + '.mp3',
  packs: ['nature', 'village', 'beasts'],
  doorAt: 19.6,
  titles: TITLES,
  cues: CUES, keys: KEYS, duration: DURATION, silenceT: 300, lineTimes: LINE_TIMES, beats: BEATS,
  clearings, shots,
  build(X) { return SCENES.map((f) => f(X)).filter(Boolean); }
};
})(typeof window !== 'undefined' ? window : globalThis);
