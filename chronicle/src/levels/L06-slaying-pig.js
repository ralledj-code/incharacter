/* Level 6: Slaying the Pig (06/07/2026). Lucien sings.
   The whole fight is in the Pig's compound at the bottom of the cave, round a great pool of blood: they drive him back, Lucien's fire,
   the burned room (the prisoners), the Pig drags Arthas under the blood and nearly drowns him, they haul him out, the Pig falls.
   Then the ash next door, the black water from the rock into a corrupted well (a wolf rises out of it), down into the drowned dead city
   of Stagford, the last prisoner turns out to be Severin (Baphomet in a vision, the elixir), Lucien pours it out alone,
   and the church: the High Inquisitor, their father, with something red-eyed under a grate in his floor.
   Lyrics: Whisper transcript, all lines matched. Beats: scripts/beats.py (109 BPM). */
(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, ss, M, bx, cy, cn, ic, solid, R, pick } = C;
const { chars, put, railPts, lay, severin } = C.lib;
const ID = 'slaying-pig';
const DURATION = 343.7;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

const CHORUS = ['Oh, Alaron, what have we found', 'Beneath the cave, below the ground?', 'The dead of Stagford drowned in dread,', 'A city empty, a city dead,', 'I carry fire, I carry blame,', 'I carry every whispered name'];
const CUES = [
  { id: 'intro', t: 0, v: 0.4, motes: 'dust', stamp: '', lines: [] },
  { id: 'v1', t: 9.5, v: 0.5, motes: 'embers', stamp: '06/07/2026', lines: ['The pig, the beast, we drove it back,', 'Smoke poured thick where my fire cracked,', 'I sent the flame, I did not know', 'Souls were burning down below', 'God forgive me what I’ve done,', 'I hear them screaming one by one,', 'The room fills black, my hands still shake,', 'Oh God, oh God, what did I make?'] },
  { id: 'v2', t: 66.4, v: 0.8, motes: 'ash', stamp: '', lines: ['The pig is dead, we bled him out,', 'We’re broken, torn, but still we shout,', 'Next door lies ash, two bodies still,', 'My fireball, my hand, my will', 'The water runs from stone and bone,', 'A well corrupted, blood its own,', 'The black that turns a man to wolf', 'Flows from the death I built myself', 'It’s all connected, root to vein,', 'The water carries all our pain,', 'And every truth I learn tonight', 'Cuts deeper than the last cold light'] },
  { id: 'chorus', t: 124.4, v: 2.2, motes: 'ash', stamp: 'Stagford', lines: CHORUS },
  { id: 'inst', t: 151.5, v: 1.6, motes: 'ash', stamp: '', lines: [] },
  { id: 'v3', t: 162.5, v: 0.5, motes: 'fireflies', stamp: '', lines: ['Her face was his, the prisoner turned,', 'Severin spoke, the words still burn:', '“Baphomet comes, there’s no delay,', 'The day they broke you was not that day,', 'They meant to save you, not to kill,', 'Pour the elixir, bend your will,', 'Let the beast go free from chains,', 'Or he’ll return through blood and flames”'] },
  { id: 'v3b', t: 197.2, v: 0.5, motes: 'ash', stamp: '', lines: ['I told my brothers what she said,', 'Arthas doubted, shook his head,', 'Cedric’s eyes stayed sharp and still,', 'None of them believed her ill', 'I kept the vial hid from sight,', 'I would not free that captive knight,', 'I poured it out upon the stone,', 'I’ll save her by myself…', 'Alone'] },
  { id: 'chorus2', t: 236.1, v: 2.0, motes: 'ash', stamp: '', lines: CHORUS },
  { id: 'bridge', t: 263.9, v: 0.6, motes: 'dust', stamp: 'the church', lines: ['Back to the church, their father’s hall,', 'The High Inquisitor hears it all,', 'He does not flinch, he does not say', 'Who holds the beast that’s caged away', 'The church knows more than it will tell,', 'Baphomet’s kept, but not kept well,', 'What game is this their father plays?', 'What silence hides behind his gaze?'] },
  { id: 'outro', t: 303.6, v: 0.5, motes: 'dust', stamp: '', lines: ['The water still runs black and deep,', 'The city’s dead don’t rest, don’t sleep,', 'I do not know what’s true, what’s lie,', 'Only that something waits nearby'] },
  { id: 'final', t: 324.5, v: 0.15, motes: 'ash', stamp: '', lines: [] }
];
const LINE_TIMES = [20.46, 25.66, 30, 35, 40, 43.74, 48.52, 53.46,
  66.94, 71.6, 75.34, 79.74, 84.4, 89.06, 93.46, 97.88, 102.46, 106.86, 111.4, 115.76,
  124.88, 129.54, 133.7, 138.22, 142.32, 146.94,
  163, 167.5, 172.26, 176.32, 180.8, 184.14, 188.52, 193.3,
  197.66, 202.88, 207.32, 211.8, 215.88, 219.14, 223.48, 228.1, 233.36,
  236.58, 241.36, 245.5, 248.88, 254.04, 258.58,
  264.48, 269.32, 273.74, 278.02, 282.34, 286.8, 291.04, 295.6,
  304.06, 308.52, 313.41, 317.56];
const BEATS = {"bpm":109.14,"beats":[0.29,0.83,1.38,1.9,2.4,2.93,3.5,4.0,4.58,5.17,5.97,6.62,7.12,7.78,8.42,8.99,9.49,9.92,10.35,11.01,11.54,12.06,12.77,13.34,13.9,14.34,14.9,15.42,15.95,16.38,16.86,17.42,18.0,18.61,19.15,19.76,20.35,20.94,21.46,21.81,22.24,22.67,23.26,23.76,24.14,24.45,24.83,25.39,25.97,26.67,27.1,27.6,27.97,28.37,29.04,29.62,30.16,30.72,31.2,31.57,31.98,32.42,32.72,33.26,33.57,34.13,34.78,35.38,35.84,36.32,36.77,37.1,37.92,38.54,38.85,39.44,39.74,40.34,40.82,41.42,42.1,42.66,43.02,43.49,44.11,44.67,45.01,45.54,46.16,46.75,47.28,47.6,48.18,48.75,49.34,49.98,50.53,51.07,51.62,51.98,52.46,52.82,53.23,53.65,54.19,54.85,55.38,55.87,56.58,57.17,57.74,58.34,58.93,59.55,60.11,60.69,61.26,61.86,62.42,62.99,63.57,64.16,64.74,65.31,65.87,66.46,67.02,67.6,68.1,68.43,69.01,69.33,69.92,70.45,71.04,71.6,72.1,72.4,72.74,73.31,73.86,74.45,74.78,75.44,76.14,76.7,77.18,77.82,78.42,79.14,79.54,80.13,80.7,81.28,81.84,82.42,82.98,83.55,84.11,84.69,85.25,85.81,86.11,86.66,87.2,87.5,88.08,88.64,89.23,89.78,90.24,90.91,91.34,91.74,92.05,92.69,93.15,93.54,93.98,94.56,94.99,95.42,96.14,96.54,97.02,97.68,98.21,98.8,99.23,99.62,99.92,100.46,101.04,101.58,101.92,102.48,103.15,103.82,104.42,104.94,105.34,105.95,106.42,106.88,107.42,107.9,108.32,108.86,109.34,109.95,110.42,110.96,111.34,111.82,112.32,112.83,113.33,114.02,114.61,115.06,115.6,116.22,116.82,117.36,117.98,118.42,118.8,119.28,119.68,120.22,120.78,121.23,121.89,122.43,122.99,123.54,124.1,124.64,125.15,125.76,126.35,126.86,127.42,127.98,128.54,129.07,129.65,130.19,130.75,131.31,131.86,132.4,132.96,133.5,134.08,134.56,134.91,135.41,135.71,136.21,136.8,137.33,137.81,138.24,138.7,139.01,139.58,140.11,140.66,141.18,141.52,141.98,142.3,142.82,143.39,143.94,144.48,145.06,145.58,146.18,146.69,147.22,147.76,148.35,148.86,149.44,149.95,150.51,151.04,151.63,152.16,152.74,153.26,153.82,154.37,154.93,155.47,156.06,156.58,157.14,157.68,158.24,158.77,159.34,159.87,160.43,160.98,161.54,162.08,162.64,163.18,163.74,164.13,164.54,164.94,165.39,165.95,166.37,166.99,167.6,168.16,168.7,169.22,169.81,170.35,170.91,171.49,172.0,172.54,173.12,173.5,174.21,174.69,174.99,175.31,175.82,176.42,176.93,177.52,178.1,178.62,179.28,179.73,180.53,180.83,181.58,181.9,182.46,183.01,183.46,183.76,184.11,184.67,185.22,185.78,186.32,186.77,187.12,187.62,188.02,188.51,189.07,189.6,189.9,190.4,190.72,191.22,191.81,192.35,192.77,193.36,194.02,194.72,195.1,195.68,196.21,196.77,197.3,197.87,198.4,198.94,199.44,200.05,200.56,200.88,201.41,201.81,202.27,202.78,203.33,203.87,204.46,205.18,205.78,206.22,206.72,207.15,207.68,208.03,208.4,208.78,209.57,210.14,210.93,211.47,212.05,212.58,213.15,213.68,214.16,214.51,214.98,215.31,215.86,216.32,216.94,217.5,218.03,218.58,219.12,219.66,220.21,220.77,221.3,221.82,222.18,222.66,223.07,223.49,224.03,224.58,225.14,225.66,226.21,226.75,227.31,227.84,228.38,228.93,229.47,230.02,230.56,231.1,231.65,232.19,232.74,233.28,233.82,234.35,234.91,235.46,236.0,236.54,237.1,237.6,238.19,238.74,239.28,239.82,240.32,240.91,241.39,242.02,242.54,243.1,243.68,244.21,244.78,245.3,245.9,246.38,246.96,247.49,248.03,248.58,249.1,249.66,250.24,250.77,251.34,251.86,252.43,252.94,253.34,253.74,254.05,254.56,255.06,255.66,256.21,256.78,257.31,257.92,258.4,258.96,259.49,260.05,260.58,261.12,261.66,262.24,262.75,263.33,263.86,264.4,264.94,265.46,265.94,266.72,267.34,267.65,267.98,268.51,268.82,269.31,269.79,270.14,270.59,271.07,271.63,272.08,272.54,273.01,273.66,274.16,274.72,275.31,275.84,276.37,276.86,277.49,278.02,278.53,279.04,279.44,279.87,280.18,280.48,280.94,281.76,282.26,282.77,283.3,283.78,284.29,285.06,285.6,286.32,286.7,287.23,287.79,288.53,288.86,289.36,289.95,290.59,291.04,291.57,292.08,292.51,292.94,293.49,294.29,294.83,295.39,295.71,296.14,296.45,297.04,297.54,297.9,298.3,298.62,299.17,299.71,300.26,300.8,301.34,301.81,302.45,302.98,303.52,304.06,304.61,305.15,305.7,306.24,306.78,307.09,307.62,308.14,308.74,309.34,309.71,310.3,310.88,311.28,311.65,312.0,312.37,312.91,313.41,313.98,314.29,314.78,315.12,315.65,316.19,316.93,317.42,317.97,318.53,319.09,319.41,319.94,320.51,320.98,321.44,321.92,322.32,322.8,323.28,323.81,324.35,324.93,325.47,326.02,326.56,327.12,327.66,328.22,328.77,329.34,329.89,330.45,331.01,331.58,332.14,332.74,333.31,333.92,334.51,335.07,335.71,336.32,336.96,337.5,338.08,338.62,339.25,339.84,340.45,340.94,341.54,342.11,342.67],"bars":[1.38,3.5,5.97,8.42,10.35,12.77,14.9,16.86,19.15,21.46,23.26,24.83,27.1,29.04,31.2,32.72,34.78,36.77,38.85,40.82,43.02,45.01,47.28,49.34,51.62,53.23,55.38,57.74,60.11,62.42,64.74,67.02,69.01,71.04,72.74,74.78,77.18,79.54,81.84,84.11,86.11,88.08,90.24,92.05,93.98,96.14,98.21,99.92,101.92,104.42,106.42,108.32,110.42,112.32,114.61,116.82,118.8,120.78,122.99,125.15,127.42,129.65,131.86,134.08,135.71,137.81,139.58,141.52,143.39,145.58,147.76,149.95,152.16,154.37,156.58,158.77,160.98,163.18,164.94,166.99,169.22,171.49,173.5,175.31,177.52,179.73,181.9,183.76,185.78,187.62,189.6,191.22,193.36,195.68,197.87,200.05,201.81,203.87,206.22,208.03,210.14,212.58,214.51,216.32,218.58,220.77,222.66,224.58,226.75,228.93,231.1,233.28,235.46,237.6,239.82,242.02,244.21,246.38,248.58,250.77,252.94,254.56,256.78,258.96,261.12,263.33,265.46,267.65,269.31,271.07,273.01,275.31,277.49,279.44,280.94,283.3,285.6,287.79,289.95,292.08,294.29,296.14,297.9,299.71,301.81,304.06,306.24,308.14,310.3,312.0,313.98,315.65,317.97,319.94,321.92,323.81,326.02,328.22,330.45,332.74,335.07,337.5,339.84,342.11],"hits":[21.46,23.76,25.97,30.72,31.2,33.26,37.92,39.74,43.49,49.34,56.58,72.66,81.84,84.11,85.25,88.64,130.19,152.16,153.26,154.37,155.47,156.58,157.68,158.77,159.87,160.98,162.08,163.18,165.39,166.37,166.99,167.6,169.81,170.91,175.31,175.82,176.42,176.93,177.52,178.62,179.73,180.53,181.58,183.01,184.11,198.4,198.94,199.44,219.12,220.21,224.58,242.02,261.66,262.75,264.94,265.94,266.72,274.72,276.86,280.94,281.76,283.3,299.17,299.71,300.8,301.81,304.06,306.24,307.62,308.14,309.34,310.3,310.88,312.0,313.98,316.19,323.81,324.35,325.47,326.02,326.56,327.66,332.14,339.84]};

C.defineMood('pigfight', 0x1c0a08, 0.024, 0x080202, 0x2a0a06, 0xc06848, 0x2a100a, 1.0, 0xff8050, 0.55, 0xff8a40, 2.2, 0x281410, 0, 0, 0);
C.defineMood('blackwater', 0x080a0c, 0.03, 0x020203, 0x0a0c10, 0x8890a8, 0x14161a, 0.9, 0x8090b0, 0.35, 0xffb070, 2.0, 0x1a1c20, 0, 0, 0);
C.defineMood('deadcity', 0x0a1014, 0.022, 0x020406, 0x0c1820, 0x7a90a8, 0x10161c, 0.85, 0x90a8c0, 0.4, 0xffa860, 2.0, 0x161c22, 0, 0, 0.3, 0x50c0ff, 0x8070ff);
C.defineMood('church', 0x1a1610, 0.018, 0x0a0806, 0x2a2016, 0xffe0b0, 0x2a2016, 1.0, 0xffe0c0, 0.5, 0xffd090, 1.6, 0x2a2218, 0, 0, 0);
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 9.5, m: 'pigfight', b: 1.5 }, { t: 25.9, m: 'flash', b: 0.1 }, { t: 26.3, m: 'pigfight', b: 1.2 },
  { t: 44.5, m: 'wellRed', b: 2 }, { t: 58, m: 'pigfight', b: 3 }, { t: 75, m: 'crater', b: 3 }, { t: 84, m: 'blackwater', b: 4 },
  { t: 124.4, m: 'deadcity', b: 4 }, { t: 172, m: 'wellRed', b: 1.5 }, { t: 181, m: 'deadcity', b: 3 }, { t: 193.2, m: 'crater', b: 0.8 }, { t: 197.4, m: 'deadcity', b: 2 },
  { t: 263.5, m: 'church', b: 4 }, { t: 286.6, m: 'gaol', b: 3 }, { t: 303.6, m: 'blackwater', b: 5 }, { t: 324, m: 'black', b: 8 }
];
const TITLES = [
  { t: 133.9, name: 'Stagford', sub: 'the city below the cave' },
  { t: 269.5, name: 'The High Inquisitor', sub: 'the church · Arthas and Cedric’s father' }
];

/* places along the rail (metres) */
const DP = 36;       // the blood pool in the Pig's compound
const DCITY = 92;    // the drowned city starts
const DV = 150;      // the square where Severin speaks
const DCH = 238;     // the church

/* ---- helpers ---- */
const darkTint = (g, hex) => {
  const one = (x) => { const y = x.clone(); if (y.color) y.color.setHex(hex); return y; };
  if (g) g.traverse((m) => { if (m.isMesh) m.material = Array.isArray(m.material) ? m.material.map(one) : one(m.material); });
  return g;
};

const SCENES = [
  /* ---- the compound: the blood pool, the burned keep, the ash next door, the black water and the well ---- */
  function compound(X) {
    const ch = chars(X), g = new THREE.Group(), Lk = X.line;
    g.add(C.lib.cave(X, 10, 82, { w: 16, h: 18, wFn: (d) => 1 - 0.55 * ss(62, 78, d) + 0.0, fungus: 0xff7040 }));
    // the compound's frame: -z ahead along the rail, +x right; the pool in the middle
    const F = new THREE.Group(); F.position.copy(X.at(DP, 0, 0)); F.rotation.y = X.yawAt(DP); g.add(F); F.updateMatrixWorld(true);
    const Wp = (x, y, z) => F.localToWorld(V3(x, y, z));
    const pool = new THREE.Mesh(new THREE.CircleGeometry(5.6, 32), new THREE.MeshLambertMaterial({ color: 0x220303, emissive: 0x0c0101 })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.04; F.add(pool);
    const rim = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; rim.push(ic(R(0.35, 0.55), 0, 0x4a3a34, [Math.cos(a) * 5.9, 0.1, Math.sin(a) * 5.9], [1.2, 0.5, 1])); }
    F.add(solid(rim));
    const sheen = []; for (let i = 0; i < 6; i++) { const s = X.glow(0xff3020, R(1.5, 3), 0.08); s.position.set(R(-3, 3), 0.1, R(-3, 3)); F.add(s); sheen.push(s); }
    // the Pig's keep behind the pool, burned out: black window, smoke
    const brick = new THREE.MeshLambertMaterial({ color: 0x6a6058, map: C.tex('castle_brick_07_diff', 3, 3) || null });
    const KB = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brick); m.position.set(x, y, z); F.add(m); };
    const kz = -15;
    KB(5.6, 10, 1, -4.4, 5, kz); KB(5.6, 10, 1, 4.4, 5, kz); KB(3.2, 1.2, 1, 0, 3.8, kz); KB(3.2, 3.4, 1, 0, 8.3, kz); KB(14.4, 10, 1, 0, 5, kz - 9);
    KB(1, 10, 9, -6.7, 5, kz - 4.5); KB(1, 10, 9, 6.7, 5, kz - 4.5); KB(14.4, 0.4, 9, 0, 4.4, kz - 4.5);
    F.add(solid([bx(15, 0.6, 10, 0x2a1e18, [0, 10.2, kz - 4.5]), bx(2.8, 3.2, 0.1, 0x1a100a, [0, 1.6, kz + 0.52])]));
    const winFire = []; for (let i = 0; i < 5; i++) { const f = X.glow(0xff6a20, R(1.5, 2.6), 0); f.position.set(R(-1.2, 1.2), 5.5 + R(-0.4, 0.6), kz - 1.2); F.add(f); winFire.push(f); }
    const smoke = []; for (let i = 0; i < 14; i++) { const s = C.lib.smoke(X, 0x141010, R(2.5, 4.5), 0); F.add(s); smoke.push({ s, ph: R(0, 1), x: R(-1.5, 1.5) }); }
    // the room behind the window: the prisoners, burned (a camera looks in through the window on "souls were burning")
    const pris = []; for (let k = 0; k < 3; k++) { const p = ch.person({ seed: 6100 + k * 9, outfit: 'peasant', pose: 'Fixing_Kneeling' }); darkTint(p, 0x2a1a14); p.position.set(-2 + k * 2, 4.6, kz - 3 - (k % 2)); p.rotation.y = R(-0.5, 0.5); F.add(p); pris.push(p); }
    // next door: a burned hut, no roof, two bodies in the ash
    const hut = []; const hx = 10.5, hz = -7;
    hut.push(bx(5, 2.4, 0.4, 0x1c1614, [hx, 1.2, hz - 2.5]), bx(0.4, 1.6, 5, 0x1c1614, [hx - 2.5, 0.8, hz]), bx(0.4, 2.8, 5, 0x1c1614, [hx + 2.5, 1.4, hz]), bx(2.4, 1.1, 0.4, 0x1c1614, [hx + 1.2, 0.55, hz + 2.5]),
      bx(0.25, 0.25, 5.4, 0x0e0a08, [hx - 0.5, 2.6, hz], [0.3, 0, 0.5]), bx(4.6, 0.04, 4.6, 0x2a2420, [hx, 0.03, hz]));
    F.add(solid(hut));
    const ashBodies = [0, 1].map((k) => { const b = lay(ch.person && ch.person({ bake: true, seed: 6200 + k * 5, outfit: 'peasant' })); if (b) { darkTint(b, 0x141010); b.position.set(hx - 0.8 + k * 1.6, 0.02, hz + (k ? 0.6 : -0.4)); b.rotation.y = k ? 2.6 : 0.4; F.add(b); } return b; });
    const embers = []; for (let i = 0; i < 8; i++) { const e = X.glow(0xff5a20, R(0.3, 0.7), 0.6); e.position.set(hx + R(-2, 2), 0.1, hz + R(-2, 2)); F.add(e); embers.push(e); }
    // the black water: out of the rock on the left, a channel into a corrupted well
    const wellP = V3(-10, 0, -3), rock = V3(-15.5, 0, -12);
    F.add(solid([ic(3.4, 0, 0x3a3634, [rock.x, 2.4, rock.z], [1, 1.5, 1]), cy(1.25, 1.35, 0.8, 14, 0x5a5650, [wellP.x, 0.4, wellP.z])]));
    const blk = new THREE.MeshLambertMaterial({ color: 0x050608, emissive: 0x010204 });
    const wd = new THREE.Mesh(new THREE.CircleGeometry(1.05, 20), blk); wd.rotation.x = -Math.PI / 2; wd.position.set(wellP.x, 0.82, wellP.z); F.add(wd);
    const chan = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1), blk); const cv = rock.clone().sub(wellP); chan.scale.y = cv.length() - 2.6; chan.rotation.set(-Math.PI / 2, 0, Math.atan2(cv.x, cv.z)); chan.position.copy(wellP.clone().add(rock).multiplyScalar(0.5)).setY(0.05); F.add(chan);
    const glints = []; for (let i = 0; i < 10; i++) { const s = X.glow(0x8aa0c0, 0.25, 0.4); F.add(s); glints.push({ s, ph: i / 10 }); }
    // the channel on into the dark, down toward the city (the water carries all our pain)
    const down = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1), blk); down.scale.y = 46; down.rotation.set(-Math.PI / 2, 0, 0); down.position.set(-9.6, 0.05, -40); F.add(down);
    const wolf = C.creature('wolf', { h: 1.5, tint: 0x0c0c10, eyes: 0xff2a10 }); if (wolf) { wolf.userData.label = 'water-wolf'; X.anims.push(wolf); wolf.position.set(wellP.x + 1.6, 0, wellP.z + 1.2); F.add(wolf); }
    const mist = C.lib.smoke(X, 0x0a0a0e, 4, 0); mist.position.set(wellP.x + 1.2, 1.2, wellP.z + 1); F.add(mist);

    // the fight
    const pig = C.lib.pig(X, { pose: 'Sword_Idle' }), pigDead = lay(C.lib.pig(X, { bake: true }), 'Idle_Loop', 0.2);
    const lu = ch.lucien({ pose: 'Idle_Loop' }), art = ch.arthas({ pose: 'Sword_Idle' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    [pig, lu, art, ced].forEach((o) => o && F.add(o));
    if (pig) pig.position.set(-0.5, 0, -8.5);
    if (pigDead) { pigDead.position.set(-4.6, 0.02, 2.4); pigDead.rotation.y = 2.2; pigDead.visible = false; F.add(pigDead); }
    lu.position.set(0.8, 0, 16); art.position.set(-1.2, 0, 15); ced.position.set(2.2, 0, 15.5);
    const P = (x, z, y) => V3(x, y || 0, z);
    const fireT = Lk(1), grabT = 43.6, underT = 45.8, pullT = 57.0, outT = 61.0, killT = 64.6;
    const acts = [
      pig && C.act(pig, [{ t: 0, pose: 'Sword_Idle', face: P(0, 10) },
        { t: 12.5, to: [P(-3.4, -5), P(-6.4, -0.5), P(-3.6, 4.2)], by: 17.5 }, { t: 17.5, pose: 'Sword_Idle', face: P(-1.2, 7) },        // round the pool at them
        { t: Lk(0), to: P(-4.8, 1.4), move: 1.5, back: true }, { t: Lk(0, 1.6), pose: 'Sword_Idle', face: P(-1, 6) },                   // "we drove it back"
        { t: Lk(4, -1.6), to: P(-2.6, 3.6), move: 1.4 }, { t: grabT, to: P(-1.6, 1.4, -0.45), move: 2.0, air: true },                     // he takes Arthas into the blood
        { t: underT, pose: 'Sword_Idle', face: P(-0.8, 0.6) },
        { t: Lk(7, 0.4), to: P(-3.4, -1.2, -0.3), move: 1.6, air: true, back: true },                                                       // Cedric's blows drive him off
        { t: outT, to: P(-4.0, 1.8), move: 1.4, air: true }, { t: outT + 1.4, pose: 'Sword_Idle', face: P(0, 3) },
        { t: killT, show: false }], { ignoreGround: true }),
      C.act(art, [{ t: 0, face: P(0, 0) }, { t: 10.6, to: [P(-1.2, 10), P(-1.6, 6.8)], by: 15.5 }, { t: 15.5, pose: 'Sword_Idle', face: P(-3.6, 4.2) },
        { t: Lk(0, 0.2), to: P(-3.0, 4.4), move: 1.4 }, { t: Lk(0, 1.6), pose: 'Sword_Idle', face: P(-4.8, 1.4) },
        { t: grabT, to: P(-0.9, 1.0, -1.1), move: 2.0, air: true },                                                                         // dragged under
        { t: underT, to: P(-0.8, 0.6, -1.5), move: 6, air: true },                                                                          // only his head above the blood, then not even that
        { t: pullT, to: P(1.4, 4.6), move: 2.4, air: true }, { t: pullT + 2.4, pose: 'Fixing_Kneeling', face: P(-1, 0) },                // hauled out
        { t: outT + 0.8, pose: 'Sword_Idle', face: P(-4.0, 1.8) }, { t: killT - 1.6, to: P(-2.6, 2.8), move: 1.6 }, { t: killT, pose: 'Sword_Idle', face: P(-4.6, 2.4) },   // the killing blow
        { t: Lk(9, 0.2), pose: 'Fixing_Kneeling', face: P(-4.6, 2.4) }], { ignoreGround: true }),
      C.act(ced, [{ t: 0, face: P(0, 0) }, { t: 11.0, to: [P(2.2, 10), P(0.8, 7.0)], by: 15.8 }, { t: 15.8, pose: 'Idle_Loop', face: P(-3.6, 4.2) },
        { t: Lk(0, 0.4), to: P(-2.0, 3.0), move: 1.2 }, { t: Lk(0, 1.6), pose: 'Sword_Idle', face: P(-4.8, 1.4) },
        { t: Lk(4, -1.0), to: P(-0.2, 5.6), move: 0.6, back: true }, { t: Lk(4, -0.4), pose: 'Idle_Loop', face: P(-2.6, 3.6) },            // knocked back
        { t: Lk(7, -0.6), to: P(-2.2, 1.6), move: 1.0 }, { t: Lk(7, 0.4), pose: 'Sword_Idle', face: P(-3.4, -1.2) },
        { t: pullT, to: P(0.4, 2.6), move: 0.8 }, { t: pullT + 0.8, pose: 'Idle_Loop', face: P(-0.8, 0.6) },
        { t: Lk(9), pose: 'Sword_Idle', face: P(-6, 6) }]),
      C.act(lu, [{ t: 0, face: P(0, 0) }, { t: 10.4, to: [P(0.8, 12), P(1.6, 8.4)], by: 15.4 }, { t: 15.4, pose: 'Spell_Simple_Idle_Loop', face: P(-3.6, 4.2) },
        { t: fireT - 0.4, pose: 'Spell_Simple_Idle_Loop', face: P(-4.8, 1.4) },                                                             // "smoke poured thick where my fire cracked"
        { t: Lk(2, -0.2), pose: 'Idle_Loop', face: P(0, kz) },                                                                             // he looks up at the window
        { t: Lk(6, -0.3), pose: 'Idle_Loop', face: P(0, kz) },
        { t: Lk(7, 0.2), to: P(1.2, 3.4), move: 1.6 }, { t: Lk(7, 1.8), pose: 'Spell_Simple_Idle_Loop', face: P(-3.4, -1.2) },
        { t: pullT, to: P(0.6, 3.6), move: 0.6 }, { t: pullT + 0.6, pose: 'Crouch_Idle_Loop', face: P(-0.8, 0.6) },
        { t: outT, pose: 'Spell_Simple_Idle_Loop', face: P(-4.0, 1.8) },
        { t: Lk(9), pose: 'Spell_Simple_Idle_Loop', face: P(-6, 6) },                                                                        // "still we shout"
        { t: Lk(10), to: P(7.2, -4.4), move: 3.2 }, { t: Lk(10, 3.2), pose: 'Idle_Loop', face: P(hx, hz) },                                // next door
        { t: Lk(11, -0.2), pose: 'Spell_Simple_Idle_Loop', face: P(hx, hz) },                                                               // "my fireball, my hand"
        { t: Lk(12, -0.4), to: [P(0, -3.6), P(-7.4, -1.4)], move: 4.0 }, { t: Lk(12, 3.6), pose: 'Idle_Loop', face: wellP },                // to the water
        { t: Lk(16, 0.6), to: [P(-9.0, -8), P(-9.6, -26), P(-9.6, -34)], speed: 1.3 }, { t: 122, show: false }]),
      wolf && C.act(wolf, [{ t: 0, show: false }, { t: Lk(14, -0.2), show: true, pose: 'Idle_2_HeadLow', face: P(-7.4, -1.4) }, { t: Lk(14, 1.4), pose: 'Idle', face: P(-7.4, -1.4) }, { t: Lk(15, 0.6), show: false }], { gait: [['Walk', 0.69], ['Gallop', 2.57]], idle: 'Idle' })
    ].filter(Boolean);
    // fire bolts at the Pig
    const bolts = [0, 1, 2].map(() => { const b = X.glow(0xff8a30, 1.0, 0); F.add(b); return b; });
    const splash = X.glow(0xff2a10, 3.2, 0); F.add(splash);
    X.anchors.F = F; X.anchors.pool = new THREE.Object3D(); F.add(X.anchors.pool);
    X.anchors.pig = pig || F; X.anchors.pigDead = pigDead || F; X.anchors.luF = lu; X.anchors.arthasF = art; X.anchors.cedricF = ced; X.anchors.wolf = wolf || F;
    X.cmp = { kz, hx, hz, wellP, rock }; const K = X.cmp;
    return {
      group: g, d0: 8, d1: 84, vis: 60,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx));
        if (pigDead) pigDead.visible = t >= killT;
        sheen.forEach((s, i) => { s.material.opacity = 0.1 + 0.08 * Math.sin(ctx.time * 0.7 + i); });
        winFire.forEach((f, i) => { f.material.opacity = 0.55 + 0.3 * Math.sin(ctx.time * 9 + i * 2) * (t < 70 ? 1 : 0.4); });
        smoke.forEach((o) => { const u = (ctx.time * 0.12 + o.ph) % 1; o.s.position.set(o.x + u * 2, 6 + u * 10, kz - 1); o.s.material.opacity = 0.45 * Math.sin(u * Math.PI); });
        embers.forEach((e, i) => { e.material.opacity = 0.4 + 0.3 * Math.sin(ctx.time * 3 + i); });
        const lp = F.worldToLocal(lu.getWorldPosition(V3(0, 0, 0))).add(V3(0, 1.4, 0)), pp = pig ? pig.position.clone().add(V3(0, 1.8, 0)) : V3(0, 0, 0);
        bolts.forEach((b, i) => { const u = (t - fireT - i * 0.45) / 0.5; b.material.opacity = u > 0 && u < 1 ? 1 : 0; if (u > 0 && u < 1) b.position.lerpVectors(lp, pp, u); });
        splash.position.set(-1, 0.4, 1); splash.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - grabT - 1.6) / 0.8);
        glints.forEach((o) => { const u = (ctx.time * 0.15 + o.ph) % 1; o.s.position.lerpVectors(rock, wellP, u).setY(0.1); });
        mist.material.opacity = 0.5 * ss(Lk(14, -0.5), Lk(14, 0.5), t) * (1 - ss(Lk(15), Lk(15, 1), t));
        const c = t > 83 && t < 124 ? Wp(K.wellP.x, 0, K.wellP.z) : Wp(0, 0, 0); ctx.light(0, c.x, 2.4, c.z, t > 83 && t < 124 ? 0x8aa0d0 : 0xff3a20, t > 83 && t < 124 ? 2.0 : 1.8, 26);
        const ash = t > Lk(10, -1) && t < Lk(12, -0.5), w = ash ? Wp(hx, 3, hz) : Wp(0, 5.5, kz); ctx.light(1, w.x, w.y, w.z, 0xff7a30, ash ? 2.8 : 2.6, 30);
      }
    };
  },

  /* ---- the drowned dead city of Stagford; Severin; Baphomet in a vision; the elixir poured out ---- */
  function deadCity(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), Lk = X.line;
    const d0 = DCITY, d1 = DCH - 10;
    g.add(C.lib.cave(X, d0 - 8, d1 + 4, { w: 26, h: 30, fungus: 0x60a0ff }));
    // black water both sides of a stone causeway
    const blk = new THREE.MeshLambertMaterial({ color: 0x06080c, emissive: 0x010306 });
    for (let d = d0; d < d1; d += 6) [-1, 1].forEach((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 22), blk); m.position.copy(X.at(d + 3, s * 13.5, 0.04)); m.rotation.set(-Math.PI / 2, 0, X.yawAt(d + 3) + Math.PI / 2); g.add(m); });
    const cob = C.tex('cobblestone_floor_04_diff', 1, 1);
    for (let d = d0; d < d1; d += 6) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 6.4), new THREE.MeshLambertMaterial({ color: 0x6a7078, map: cob || null })); m.position.copy(X.at(d + 3, 0, 0.03)); m.rotation.set(-Math.PI / 2, 0, X.yawAt(d + 3)); g.add(m); }
    // the dead houses, dark windows, standing in the water
    const hs = [];
    for (let d = d0 + 4; d < d1 - 4; d += 9) [-1, 1].forEach((s) => { if (Math.abs(d - DV) < 9) return; const p = X.at(d + R(-1.5, 1.5), s * R(7.5, 10), 0); hs.push({ x: p.x, z: p.z, yaw: X.yawAt(d) + (s > 0 ? -Math.PI / 2 : Math.PI / 2), w: pick([4, 6]), d: 6, st: R(0, 1) < 0.6 ? 2 : 1, brick: R(0, 1) < 0.4 }); });
    const vil = kit.village(hs, { tint: 0x8090a8, glass: 0x0a0c12 }); if (vil) g.add(vil);
    // the drowned dead, and their spirits
    for (let i = 0; i < (X.mobile ? 8 : 14); i++) { const b = lay(ch.person && ch.person({ bake: true, seed: 7000 + i * 11 })); if (!b) break; darkTint(b, 0x5a6878); const s = (i % 2 ? 1 : -1); b.position.copy(X.at(d0 + 8 + i * 8.5, s * R(3.2, 6), 0.02)); b.rotation.y = R(0, TAU); g.add(b); }
    const spirits = []; for (let i = 0; i < 26; i++) { const s = X.glow(0x9ad8ff, R(0.4, 0.9), 0); s.position.copy(X.at(R(d0, d1), R(-12, 12), 0)); g.add(s); spirits.push({ s, ph: R(0, 1), y0: R(0, 2) }); }
    // the square where she speaks
    const sq = X.at(DV, 0, 0);
    const torch = (o) => { const f = X.glow(0xffa040, 1.1, 0.95); C.attach(o, 'hand_r', f, [0, 0.12, 0.05]); return f; };
    const lu = ch.lucien({ pose: 'Walk_Loop' }), art = ch.arthas({ pose: 'Walk_Loop' }), ced = ch.cedric({ pose: 'Walk_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false; torch(lu);
    const pri = ch.person({ seed: 6107, female: false, outfit: 'peasant', tint: 0x5a4a3a, pose: 'Walk_Loop' }); pri.userData.label = 'prisoner';
    const sev = severin(X, ch, { crown: true });
    [lu, art, ced, pri, sev].forEach((o) => g.add(o));
    const s0 = d0 + 4;
    lu.position.copy(X.at(s0, 0.4, 0)); art.position.copy(X.at(s0 - 1.6, -1.2, 0)); ced.position.copy(X.at(s0 - 1.8, 1.4, 0)); pri.position.copy(X.at(s0 - 3.6, 0.2, 0));
    const meet = (side, dd) => X.at(DV + dd, side, 0);
    const turnT = Lk(26), sevGo = Lk(34, -0.6), shakeT = Lk(35), hideT = Lk(38), pourT = Lk(40), aloneT = Lk(42, -1.2);
    const vial = X.glow(0x60ff90, 0.45, 0); C.attach(lu, 'hand_l', vial, [0, 0.08, 0.04]);
    const splash = X.glow(0x60ff90, 2.4, 0); splash.position.copy(meet(1.6, 1.4)).setY(0.1); g.add(splash);
    const acts = [
      C.act(lu, [{ t: 0, show: false }, { t: 124, show: true, face: X.at(s0 + 5, 0, 0) }, { t: 124.4, to: railPts(X, s0, DV - 1.4, 0.4), by: 161.5 }, { t: 161.5, pose: 'Idle_Loop', face: meet(0, 3) },
        { t: turnT + 0.6, pose: 'Idle_Loop', face: meet(-0.4, 2.2) }, { t: Lk(31, 0.6), pose: 'Idle_Loop', face: meet(-0.4, 2.2) },   // takes the elixir
        { t: Lk(34, -0.3), pose: 'Idle_Talking_Loop', face: meet(0, -4) },                                                         // "I told my brothers"
        { t: hideT, pose: 'Idle_Loop', face: meet(0, -4) },
        { t: pourT - 1.6, to: meet(1.4, 0.6), move: 1.4 }, { t: pourT - 0.2, pose: 'Crouch_Idle_Loop', face: meet(1.6, 1.4) },     // "I poured it out upon the stone"
        { t: Lk(41), pose: 'Idle_Loop', face: meet(0, 8) },
        { t: 236.4, to: railPts(X, DV + 1, d1 - 6, 0.3), by: 262.5 }, { t: 262.8, show: false }]),
      C.act(art, [{ t: 0, show: false }, { t: 124, show: true, face: X.at(s0 + 5, 0, 0) }, { t: 124.8, to: railPts(X, s0 - 1.6, DV - 4, -1.2), by: 161.8 }, { t: 161.8, pose: 'Idle_Loop', face: meet(0, 3) },
        { t: shakeT, pose: 'Idle_Loop', face: meet(-6, -8) },                                                                    // "Arthas doubted, shook his head"
        { t: aloneT, to: railPts(X, DV - 4, DV - 30, -1.2), speed: 1.3 }, { t: aloneT + 18, show: false }]),
      C.act(ced, [{ t: 0, show: false }, { t: 124, show: true, face: X.at(s0 + 5, 0, 0) }, { t: 125, to: railPts(X, s0 - 1.8, DV - 3.6, 1.4), by: 162 }, { t: 162, pose: 'Idle_Loop', face: meet(0, 3) },
        { t: Lk(36, -0.4), pose: 'Idle_Loop', face: lu },                                                                        // "Cedric's eyes stayed sharp and still"
        { t: aloneT + 0.3, to: railPts(X, DV - 3.6, DV - 30, 1.2), speed: 1.3 }, { t: aloneT + 18, show: false }]),
      C.act(pri, [{ t: 0, show: false }, { t: 124, show: true, face: X.at(s0 + 5, 0, 0) }, { t: 125.2, to: railPts(X, s0 - 3.6, DV + 2.2, -0.4), by: 161.2 }, { t: 161.2, pose: 'Idle_Loop', face: meet(0, 8) },
        { t: turnT - 0.5, pose: 'Idle_Loop', face: lu }, { t: turnT + 0.5, show: false }]),                                          // "her face was his, the prisoner turned"
      C.act(sev, [{ t: 0, show: false }, { t: turnT + 0.5, show: true, pose: 'Idle_Loop', face: lu }, { t: Lk(27), pose: 'Idle_Talking_Loop', face: lu },
        { t: Lk(28), pose: 'Spell_Simple_Idle_Loop', face: meet(5, 18) }, { t: Lk(30), pose: 'Idle_Talking_Loop', face: lu },
        { t: Lk(31, -0.2), pose: 'Spell_Simple_Idle_Loop', face: lu }, { t: Lk(32), pose: 'Idle_Talking_Loop', face: lu }, { t: sevGo, show: false }])
    ];
    sev.position.copy(meet(-0.4, 2.2));
    // Baphomet in the vision: a giant behind the dead houses, then in chains, then in flames
    const baph = ch.baphomet ? ch.baphomet({ h: 13, pose: 'Idle_Loop' }) : null;
    if (baph) { baph.position.copy(X.at(DV + 15, 4, 0)); baph.lookAt(sq.x, 0, sq.z); g.add(baph); }
    const chains = []; const cp = X.at(DV + 15, 4, 0);
    for (let k = 0; k < 40; k++) { const a = k * 0.45; chains.push(M([cp.x + Math.cos(a) * 1.6, 2 + k * 0.16, cp.z + Math.sin(a) * 1.6], [Math.PI / 2, k % 2 ? Math.PI / 2 : 0, a], [3, 3, 3])); }
    const chainM = C.inst(kit.linkGeo, C.lamb({ color: 0xb8bcc8 }), chains); g.add(chainM);
    const flames = []; for (let k = 0; k < 10; k++) { const f = X.glow(0xff5a20, R(3, 6), 0); f.position.copy(cp).add(V3(R(-3, 3), R(0, 6), R(-3, 3))); g.add(f); flames.push(f); }
    const swirl = X.glow(0x70ffc8, 3, 0); swirl.position.copy(meet(-0.4, 2.2)).setY(1.2); g.add(swirl);
    X.anchors.luCity = lu; X.anchors.arthasCity = art; X.anchors.cedricCity = ced; X.anchors.sev = sev; X.anchors.pri = pri; X.anchors.baph = baph || sev;
    X.anchors.sq = new THREE.Object3D(); X.anchors.sq.position.copy(sq); g.add(X.anchors.sq);
    X.anchors.splash = splash;
    const visT = [Lk(28), Lk(30, 2)], chainT = [Lk(32), Lk(33)], fireT = [Lk(33), Lk(34, -0.4)];
    return {
      group: g, d0: d0 - 8, d1: d1 + 4, vis: 40,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx));
        spirits.forEach((o) => { const u = (ctx.time * 0.06 + o.ph) % 1; o.s.position.y = o.y0 + u * 9; o.s.material.opacity = (t > Lk(23) ? 0.55 : 0.25) * Math.sin(u * Math.PI); });
        const vb = (t > visT[0] && t < visT[1]) || (t > chainT[0] && t < fireT[1]) || (t > Lk(39) && t < Lk(39, 2.5));
        if (baph) { baph.visible = vb; if (baph.userData.wings) baph.userData.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.4 + 0.3 * Math.sin(ctx.time * 2)); }); }
        chainM.visible = (t > chainT[0] && t < fireT[1]) || (t > Lk(39) && t < Lk(39, 2.5));
        flames.forEach((f, k) => { f.material.opacity = t > fireT[0] && t < fireT[1] ? 0.6 + 0.3 * Math.sin(ctx.time * 9 + k) : 0; });
        swirl.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - turnT - 0.5) / 0.6) + 0.7 * Math.max(0, 1 - Math.abs(t - sevGo) / 0.6);
        vial.material.opacity = t > Lk(31, 0.4) && t < hideT ? 0.9 : 0;
        splash.material.opacity = t > pourT && t < pourT + 4 ? 0.8 * (1 - (t - pourT) / 4) : 0;
        const lp = lu.getWorldPosition(V3(0, 0, 0)); ctx.light(1, lp.x, 2.2, lp.z, 0xffa040, 2.2, 16);
        ctx.light(0, cp.x, 8, cp.z, vb ? 0xff3010 : 0x60ff90, vb ? 4 : (t > pourT && t < pourT + 4 ? 2.5 : 0), 40);
      }
    };
  },

  /* ---- the church: their father's hall, the High Inquisitor, something red-eyed under the floor ---- */
  function church(X) {
    const ch = chars(X), g = new THREE.Group(), Lk = X.line;
    const CH = new THREE.Group(); CH.position.copy(X.at(DCH, 0, 0)); CH.rotation.y = X.yawAt(DCH); g.add(CH); CH.updateMatrixWorld(true);
    const stone = new THREE.MeshLambertMaterial({ color: 0xa89c88, map: C.tex('castle_brick_07_diff', 6, 3) || null, side: THREE.DoubleSide });
    const B = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone); m.position.set(x, y, z); CH.add(m); };
    const L0 = 2, L1 = -32, HW = 7;
    B(0.6, 11, L0 - L1, -HW, 5.5, (L0 + L1) / 2); B(0.6, 11, L0 - L1, HW, 5.5, (L0 + L1) / 2); B(HW * 2, 11, 0.6, 0, 5.5, L1);
    B(HW * 2 - 4, 11, 0.6, 0, 5.5, L0 + 2); [-1, 1].forEach((s) => B(2, 6.5, 0.6, s * (HW - 1), 8.0, L0 + 2));
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, L0 - L1 + 2), new THREE.MeshLambertMaterial({ color: 0x2a2018, side: THREE.DoubleSide })); roof.rotation.x = Math.PI / 2; roof.position.set(0, 11, (L0 + L1) / 2); CH.add(roof);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, L0 - L1 + 2), new THREE.MeshLambertMaterial({ color: 0x8a8070, map: C.tex('cobblestone_floor_04_diff', 4, 9) || null })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.02, (L0 + L1) / 2); CH.add(floor);
    const cols = []; for (let z = -2; z > L1 + 3; z -= 5) [-1, 1].forEach((s) => cols.push(cy(0.45, 0.5, 10.5, 10, 0xb8ac98, [s * (HW - 2), 5.25, z])));
    cols.push(bx(6, 0.7, 3, 0xc8bca8, [0, 0.35, L1 + 4]), bx(2.6, 1.1, 1.0, 0xd8ccb8, [0, 1.25, L1 + 4.2]), bx(0.12, 2.2, 0.12, 0xc8a040, [0, 3.0, L1 + 4.6]), bx(1.1, 0.12, 0.12, 0xc8a040, [0, 3.5, L1 + 4.6]));
    CH.add(solid(cols));
    // the great window over the altar
    const glass = []; const gc = [0xd04030, 0x3070d0, 0xe0b040, 0x40a060, 0xa050c0];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) glass.push(C.part(new THREE.PlaneGeometry(0.9, 1.2), gc[(i + j * 2) % 5], M([-1.9 + i * 0.95, 4.6 + j * 1.25, L1 + 0.35])));
    CH.add(C.emis(glass, { side: THREE.DoubleSide }));
    const winG = X.glow(0xffd8a0, 9, 0.35); winG.position.set(0, 6.4, L1 + 1); CH.add(winG);
    // pews and candles
    for (let z = -4; z > L1 + 9; z -= 2.2) [-1, 1].forEach((s) => put(CH, 'Bench', V3(s * 3.0, 0, z), 0, 0.5));
    const cand = []; for (let i = 0; i < 9; i++) { const x = -2.6 + i * 0.65; put(CH, 'CandleStick', V3(x, 0.7, L1 + 3), 0, 0.5); const f = X.glow(0xffc070, 0.45, 0.9); f.position.set(x, 1.28, L1 + 3); CH.add(f); cand.push(f); }
    // the grate in the floor, and what is kept under it
    const gz = L1 + 11, gr = [];
    gr.push(bx(3.2, 0.04, 3.2, 0x050404, [0, 0.03, gz]));
    for (let i = -3; i <= 3; i++) gr.push(bx(0.08, 0.1, 3.2, 0x3a3a40, [i * 0.45, 0.08, gz]), bx(3.2, 0.1, 0.08, 0x3a3a40, [0, 0.08, gz + i * 0.45]));
    CH.add(solid(gr));
    const eyes = [-0.35, 0.35].map((x) => { const e = X.glow(0xff2a10, 0.5, 0); e.position.set(x, 0.06, gz - 0.2); CH.add(e); return e; });
    const red = X.glow(0xff2010, 4, 0); red.position.set(0, 0.1, gz); CH.add(red);
    // the black water, in a channel down the side of the nave
    const ch2 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, L0 - L1), new THREE.MeshLambertMaterial({ color: 0x050608, emissive: 0x010204 })); ch2.rotation.x = -Math.PI / 2; ch2.position.set(-HW + 1, 0.035, (L0 + L1) / 2); CH.add(ch2);
    const glints = []; for (let i = 0; i < 10; i++) { const s = X.glow(0x8aa0c0, 0.25, 0); CH.add(s); glints.push({ s, ph: i / 10 }); }
    const spirits = []; for (let i = 0; i < 16; i++) { const s = X.glow(0x9ad8ff, R(0.4, 0.8), 0); s.position.set(R(-5, 5), 0, R(L1 + 4, -2)); CH.add(s); spirits.push({ s, ph: R(0, 1) }); }
    const sevEyes = [-0.04, 0.04].map((x) => { const e = X.glow(0xb0ffe0, 0.22, 0); e.position.set(HW - 1.4 + x, 1.62, -8); CH.add(e); return e; });
    // the Inquisitor at the altar; the three of them come up the nave
    const inq = C.lib.inquisitor(X, { pose: 'Idle_Loop' }) || ch.person({ seed: 9100, tint: 0xe8e0cc });
    inq.position.set(0, 0.7, L1 + 5.4); CH.add(inq);
    const lu = ch.lucien({ pose: 'Walk_Loop' }), art = ch.arthas({ pose: 'Walk_Formal_Loop' }), ced = ch.cedric({ pose: 'Walk_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    [lu, art, ced].forEach((o) => CH.add(o));
    lu.position.set(0, 0, 1); art.position.set(-1.4, 0, 0.6); ced.position.set(1.4, 0, 0.4);
    const P = (x, z) => V3(x, 0, z), altar = P(0, L1 + 5.4);
    const walk = (o, x, dt, more) => C.act(o, [{ t: 0, show: false }, { t: 262.8, show: true, face: altar }, { t: 263.4 + dt, to: [P(x, -2), P(x, L1 + 15)], by: 270 + dt }, { t: 270 + dt, pose: 'Idle_Loop', face: altar }].concat(more || []));
    const acts = [
      C.act(inq, [{ t: 0, pose: 'Idle_Loop', face: P(0, 0) }, { t: Lk(50), pose: 'Idle_Talking_Loop', face: P(0, 0) }, { t: Lk(51, 1), pose: 'Idle_Loop', face: P(0, 0) }]),
      walk(lu, 0, 0, [{ t: 270.5, pose: 'Idle_Talking_Loop', face: altar }, { t: Lk(51), pose: 'Idle_Loop', face: altar }, { t: Lk(53, -0.5), pose: 'Idle_Loop', face: P(0, gz) }, { t: Lk(56), pose: 'Idle_Loop', face: altar }]),
      walk(art, -1.5, 0.3), walk(ced, 1.5, 0.5)
    ];
    X.anchors.CH = CH; X.anchors.inq = inq; X.anchors.luCh = lu; X.anchors.arthasCh = art;
    X.anchors.grate = new THREE.Object3D(); X.anchors.grate.position.set(0, 0, gz); CH.add(X.anchors.grate);
    X.church = { L1, gz, HW };
    return {
      group: g, d0: DCH - 6, d1: DCH + 40, vis: 30,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx));
        cand.forEach((f, i) => { f.material.opacity = 0.75 + 0.15 * Math.sin(ctx.time * 9 + i); });
        const e = Math.max(0.6 * ss(Lk(52), Lk(52, 1), t) * (1 - ss(Lk(53), Lk(53, 0.8), t)), ss(Lk(54), Lk(54, 1.2), t) * (1 - ss(Lk(56), Lk(56, 2), t)));
        eyes.forEach((s, i) => { s.material.opacity = e * (0.7 + 0.3 * Math.sin(ctx.time * 3 + i)); }); red.material.opacity = 0.5 * e;
        glints.forEach((o) => { const u = (ctx.time * 0.1 + o.ph) % 1; o.s.position.set(-HW + 1, 0.06, L0 + u * (L1 - L0)); o.s.material.opacity = t > Lk(57, -1) ? 0.6 : 0.2; });
        spirits.forEach((o) => { const u = (ctx.time * 0.07 + o.ph) % 1; o.s.position.y = u * 8; o.s.material.opacity = t > Lk(58, -0.3) ? 0.6 * Math.sin(u * Math.PI) : 0; });
        sevEyes.forEach((s) => { s.material.opacity = t > Lk(60, -0.2) && t < 326 ? 0.95 : 0; });
        const a = CH.localToWorld(V3(0, 3, L1 + 4)); ctx.light(0, a.x, 3, a.z, 0xffd090, 2.2, 30);
        const gw = CH.localToWorld(V3(0, 0.5, gz)); ctx.light(1, gw.x, 0.5, gw.z, 0xff2a10, 3 * e, 10);
      }
    };
  }
];

function clearings(X) { return []; }

function shots(X, D) {
  const A = X.anchors, H = X.hubAnchors, Lk = X.line, P = D.p;
  const wp = (o) => (o ? (o.isVector3 ? o.clone() : o.getWorldPosition(new THREE.Vector3())) : X.at(X.distAt(0) + 30, 0, 0));
  const near = (o, dx, dy, dz) => () => wp(o).add(V3(dx, dy, dz));
  const lu = H.lucien || V3(0, 0.45, -8.55);
  const f = (x, y, z) => () => A.F.localToWorld(V3(x, y, z)), c = (x, y, z) => () => A.CH.localToWorld(V3(x, y, z));
  const K = X.cmp || { kz: -15, hx: 10.5, hz: -7, wellP: V3(-10, 0, -3) }, CHd = X.church || { L1: -32, gz: -21 };
  return [
    // the Blackbird, straight down into the cave
    { t: 0, cam: D.orbit(lu, { r: 3.2, h: 1.9, a0: 0.9, w: 0.08, t0: 0, lookH: 1.5, fov: 46 }) },
    { t: 5.0, cam: D.dolly(V3(0.6, 2.4, -6.6), V3(0, 2.0, -11.4), V3(0, 1.9, -16), { fov: 60, fov1: 72 }) },
    // the compound: the charge round the pool
    { t: 9.5, cam: D.dolly(f(14, 9, 20), f(6, 5, 13), f(0, 1, -4), { fov: 60 }) },
    { t: 13.6, cam: D.fixed(f(3.6, 1.0, 9.5), near(A.pig, 0, 2.2, 0), { push: 0.2, fov: 54 }) },
    { t: 16.9, cam: D.orbit(f(-2.4, 0, 5), { r: 5.5, h: 1.6, a0: 1.2, w: 0.2, t0: 16.9, lookH: 1.6, fov: 58 }) },
    { t: Lk(0, -0.2), cam: D.fixed(f(-0.6, 1.4, 9.0), near(A.pig, 0, 2.0, 0), { push: 0.3, fov: 50 }) },                      // "we drove it back"
    { t: Lk(1, -0.3), cam: D.fixed(near(A.luF, 1.0, 1.7, 1.6), near(A.pig, 0, 2.0, 0), { fov: 52 }) },                         // "where my fire cracked"
    { t: Lk(1, 2.2), cam: D.fixed(f(4, 4, 0), f(0, 8, K.kz), { push: 0.2, fov: 54 }) },                                       // the smoke out of the window
    { t: Lk(2, -0.3), cam: D.fixed(f(1.5, 6.2, K.kz + 4), f(0, 5.0, K.kz - 3), { push: 0.4, fov: 48 }) },                       // "I sent the flame, I did not know"
    { t: Lk(3, -0.2), cam: D.fixed(f(-0.4, 5.6, K.kz + 0.8), f(0, 4.8, K.kz - 3.5), { push: 0.2, fov: 60 }) },                  // souls burning
    { t: Lk(4, -0.3), cam: D.fixed(near(A.luF, -0.8, 1.6, -1.6), near(A.luF, 0, 1.5, 0), { push: 0.25, fov: 40 }) },             // "God forgive me"
    { t: Lk(4, 3.0), cam: D.fixed(f(4.5, 2.4, 6.5), f(-1.2, 0.4, 1.2), { push: 0.2, fov: 54 }) },             // into the blood
    { t: Lk(5, 1.6), cam: D.fixed(f(1.6, 0.7, 3.4), near(A.arthasF, 0, 0.3, 0), { push: 0.2, fov: 46 }) },                    // under
    { t: Lk(6, -0.3), cam: D.fixed(f(1.9, 1.5, 7.0), near(A.luF, 0, 1.15, 0), { push: 0.3, fov: 38 }) },               // "my hands still shake"
    { t: Lk(7, -0.2), cam: D.orbit(A.pool, { r: 6, h: 1.4, a0: 2.4, w: 0.18, t0: Lk(7), lookH: 1.0, fov: 58 }) },               // "what did I make?"
    { t: 56.8, cam: D.fixed(f(2.8, 1.0, 5.6), near(A.arthasF, 0, 0.6, 0), { push: 0.2, fov: 50 }) },                           // hauled out
    { t: 60.4, cam: D.orbit(near(A.pig, 0, 0, 0), { r: 6, h: 2.2, a0: 1.8, w: 0.12, t0: 60.4, lookH: 2.2, fov: 56 }) },
    { t: 63.9, cam: D.fixed(f(-0.6, 1.1, 6.4), near(A.arthasF, 0, 1.4, 0), { fov: 54 }) },                                       // the blow
    // the aftermath
    { t: Lk(8, -0.2), cam: D.dolly(near(A.pigDead, 1.6, 4.5, 3.2), near(A.pigDead, 1.2, 2.2, 2.4), near(A.pigDead, 0, 0.4, 0), { fov: 52 }) },  // "the pig is dead"
    { t: Lk(9, -0.2), cam: D.orbit(f(0, 0, 4), { r: 5.5, h: 1.2, a0: 3.4, w: 0.1, t0: Lk(9), lookH: 1.4, fov: 56 }) },          // "still we shout"
    { t: Lk(10, -0.2), cam: D.fixed(f(K.hx - 3.6, 3.4, K.hz + 5.2), f(K.hx, 0.2, K.hz), { push: 0.25, fov: 52 }) },       // "next door lies ash"
    { t: Lk(11, -0.2), cam: D.fixed(near(A.luF, 0.8, 1.6, 1.0), near(A.luF, 0, 1.3, 0), { push: 0.3, fov: 38 }) },               // "my fireball, my hand"
    { t: Lk(12, -0.3), cam: D.dolly(f(K.wellP.x + 4, 1.4, K.wellP.z + 5), f(K.wellP.x + 2.5, 1.0, K.wellP.z + 3), f(-15.5, 1.5, -12), { fov: 56 }) },   // water from stone
    { t: Lk(13, -0.2), cam: D.fixed(f(K.wellP.x + 1.2, 2.6, K.wellP.z + 1.2), f(K.wellP.x, 0.7, K.wellP.z), { push: 0.3, fov: 50 }) },   // the corrupted well
    { t: Lk(14, -0.3), cam: D.fixed(f(K.wellP.x + 3.4, 1.0, K.wellP.z + 4.4), near(A.wolf, 0, 0.9, 0), { push: 0.25, fov: 44 }) },   // the black that turns a man to wolf
    { t: Lk(15, -0.2), cam: D.dolly(f(K.wellP.x + 2, 2.5, K.wellP.z), f(4, 3, K.kz + 3), f(K.hx, 1, K.hz), { fov: 58 }) },       // from the death I built myself
    { t: Lk(16, -0.2), smooth: 2, cam: D.track(A.luF, { offset: [0.8, 1.7, -3.0], lookOffset: [0, 0.4, 6], fov: 62 }) },       // root to vein
    { t: Lk(18, -0.3), cam: D.fixed(f(-11.2, 1.0, -22), f(-9.6, 0.1, -50), { push: 0.3, fov: 58 }) },                            // the water carries on down
    { t: Lk(19, -0.2), cam: D.fixed(near(A.luF, 0.6, 1.7, -1.4), near(A.luF, 0, 1.55, 0), { push: 0.15, fov: 42 }) },
    // Stagford
    { t: 123.6, cam: D.dolly(P(DCITY - 4, 0, 14), P(DCITY + 8, 0, 8), P(DCITY + 30, 0, 1.5), { fov: 64 }) },
    { t: Lk(21, -0.3), cam: D.track(A.luCity, { offset: [0.6, 1.7, 3.6], lookOffset: [0, 1.3, 0], fov: 56 }) },
    { t: Lk(22, -0.3), cam: D.rail({ h: 1.0, side: 4, ahead: 14, lookH: 0.4, fov: 60 }) },                                         // the dead of Stagford
    { t: Lk(23, -0.3), cam: D.rail({ h: 16, ahead: 34, lookH: 0, fov: 66 }) },                                                     // a city empty
    { t: Lk(24, -0.3), cam: D.track(A.luCity, { offset: [-0.5, 1.6, 2.2], lookOffset: [0, 1.5, 0], fov: 44 }) },                 // I carry fire
    { t: Lk(25, -0.2), cam: D.track(A.luCity, { offset: [2.6, 3.2, -4.4], lookOffset: [0, 1.2, 8], fov: 60 }) },
    { t: 151.5, cam: D.rail({ h: 2.2, ahead: 16, lookH: 1.3, fov: 62 }) },
    { t: 157.5, smooth: 2, cam: D.track(A.luCity, { offset: [2.2, 2.3, 3.2], lookOffset: [0, 1.3, 0], fov: 54 }) },
    // Severin
    { t: Lk(26, -0.3), cam: D.fixed(P(DV - 2.8, 1.4, 1.7), near(A.pri, 0, 1.5, 0), { push: 0.3, fov: 40 }) },           // the prisoner turned
    { t: Lk(27, -0.2), cam: D.orbit(A.sev, { r: 2.8, h: 1.5, a0: 2.6, w: 0.08, t0: Lk(27), lookH: 1.5, fov: 44 }) },
    { t: Lk(28, -0.3), cam: D.fixed(P(DV - 7, 0.2, 1.5), near(A.baph, 0, 8, 0), { push: 0.2, fov: 62 }) },               // "Baphomet comes"
    { t: Lk(29, -0.2), cam: D.fixed(P(DV + 4.4, -1.6, 1.7), near(A.sev, 0, 1.55, 0), { push: 0.2, fov: 40 }) },
    { t: Lk(30, -0.2), cam: D.orbit(A.sq, { r: 6, h: 2, a0: 0.4, w: 0.07, t0: Lk(30), lookH: 1.4, fov: 52 }) },
    { t: Lk(31, -0.3), cam: D.fixed(near(A.sev, 0.9, 1.3, 0.9), () => wp(A.sev).lerp(wp(A.luCity), 0.5).add(V3(0, 1.2, 0)), { push: 0.2, fov: 44 }) },   // the elixir
    { t: Lk(32, -0.3), cam: D.fixed(P(DV - 7, 2.0, 2.2), near(A.baph, 0, 7, 0), { push: 0.25, fov: 58 }) },                  // free from chains
    { t: Lk(33, -0.2), cam: D.fixed(near(A.luCity, -1.2, 1.2, -1.6), near(A.baph, 0, 6, 0), { push: 0.2, fov: 62 }) },            // blood and flames
    { t: Lk(34, -0.2), cam: D.orbit(near(A.luCity, 0, 0, -2), { r: 4.2, h: 1.6, a0: 2.4, w: 0.08, t0: Lk(34), lookH: 1.5, fov: 52 }) },   // "I told my brothers"
    { t: Lk(35, -0.2), cam: D.fixed(near(A.luCity, 0.5, 1.7, 0.4), near(A.arthasCity, 0, 1.6, 0), { push: 0.2, fov: 40 }) },      // Arthas doubted
    { t: Lk(36, -0.2), cam: D.fixed(near(A.luCity, -0.6, 1.7, 0.2), near(A.cedricCity, 0, 1.6, 0), { push: 0.2, fov: 38 }) },     // Cedric's eyes
    { t: Lk(38, -0.2), cam: D.fixed(near(A.luCity, 0.9, 1.3, 0.9), near(A.luCity, 0, 1.0, 0), { push: 0.25, fov: 40 }) },         // the vial hid from sight
    { t: Lk(39, -0.2), cam: D.fixed(P(DV - 3, -2.4, 1.2), near(A.baph, 0, 7, 0), { push: 0.3, fov: 56 }) },                  // that captive knight
    { t: Lk(40, -0.6), cam: D.fixed(near(A.splash, 1.6, 1.2, 1.6), near(A.splash, 0, 0.2, 0), { push: 0.2, fov: 46 }) },          // poured out upon the stone
    { t: Lk(41, -0.2), cam: D.fixed(near(A.luCity, 0.4, 1.7, 1.6), near(A.luCity, 0, 1.55, 0), { push: 0.2, fov: 42 }) },
    { t: Lk(42, -0.6), cam: D.orbit(A.luCity, { r: 3, r1: 16, h: 2, h1: 14, a0: 0.4, w: 0.1, t0: Lk(42, -0.6), lookH: 1.2, fov: 56 }) },   // alone
    // chorus 2: alone through the dead city
    { t: Lk(43, -0.3), smooth: 2, cam: D.track(A.luCity, { offset: [0.6, 1.7, 3.6], lookOffset: [0, 1.3, 0], fov: 56 }) },
    { t: Lk(45, -0.3), cam: D.rail({ h: 1.2, side: -4, ahead: 12, lookH: 0.4, fov: 60 }) },
    { t: Lk(46, -0.3), cam: D.track(A.luCity, { offset: [3, 5, -6], lookOffset: [0, 1, 6], fov: 60 }) },
    { t: Lk(47, -0.3), cam: D.track(A.luCity, { offset: [-0.5, 1.6, 2.2], lookOffset: [0, 1.5, 0], fov: 44 }) },
    { t: Lk(48, -0.2), smooth: 2, cam: D.track(A.luCity, { offset: [0, 2.4, -5], lookOffset: [0, 1.6, 10], fov: 62 }) },
    // the church
    { t: 262.8, cam: D.dolly(c(0, 2.0, 1.2), c(0, 2.4, -6), c(0, 3, -30), { fov: 60 }) },
    { t: Lk(49, 1.6), cam: D.fixed(c(4.4, 1.7, -10), near(A.luCh, 0, 1.4, 0), { push: 0.2, fov: 50 }) },                         // their father's hall
    { t: Lk(50, -0.2), cam: D.dolly(c(0, 1.3, CHd.L1 + 12), c(0, 1.5, CHd.L1 + 9.2), near(A.inq, 0, 1.8, 0), { fov: 44 }) },      // the High Inquisitor
    { t: Lk(51, -0.2), cam: D.fixed(c(0.5, 2.6, CHd.L1 + 7.4), c(0, 2.4, CHd.L1 + 5.4), { push: 0.2, fov: 36 }) },              // he does not flinch
    { t: Lk(52, -0.2), cam: D.fixed(c(1.6, 1.4, CHd.gz + 2.4), c(0, 0, CHd.gz), { push: 0.3, fov: 50 }) },                       // the beast caged away
    { t: Lk(53, -0.2), cam: D.orbit(c(0, 0, -16), { r: 9, h: 4, a0: 0.4, w: 0.06, t0: Lk(53), lookH: 2.4, fov: 58 }) },
    { t: Lk(54, -0.3), cam: D.fixed(c(0, 2.2, CHd.gz + 0.6), c(0, 0, CHd.gz - 0.2), { push: 0.4, fov: 44 }) },                    // kept, but not kept well
    { t: Lk(55, -0.2), cam: D.fixed(c(-3.2, 1.6, CHd.L1 + 9), near(A.inq, 0, 1.8, 0), { push: 0.2, fov: 40 }) },                  // their father plays
    { t: Lk(56, -0.2), cam: D.fixed(c(0, 2.5, CHd.L1 + 6.4), c(0, 2.45, CHd.L1 + 5.4), { push: 0.15, fov: 30 }) },               // behind his gaze
    // outro
    { t: 302.0, cam: D.fixed(c(-3.6, 1.3, 1.0), c(-6.2, 0, -20), { push: 0.3, fov: 56 }) },                                        // the water runs black
    { t: Lk(58, -0.2), cam: D.orbit(c(0, 0, -14), { r: 8, h: 1.5, a0: 0.2, w: 0.08, t0: Lk(58), lookH: 3.5, fov: 60 }) },        // the dead don't rest
    { t: Lk(59, -0.2), cam: D.fixed(near(A.luCh, 0.6, 1.7, 1.4), near(A.luCh, 0, 1.55, 0), { push: 0.2, fov: 40 }) },
    { t: Lk(60, -0.3), cam: D.fixed(c(1, 1.7, -4), c(5.6, 1.6, -8), { push: 0.45, fov: 36 }) },                                  // something waits nearby
    { t: 324.5, cam: D.dolly(c(0, 3, -6), c(0, 9, -20), c(0, 6.4, CHd.L1), { fov: 56 }) }
  ];
}

C.levels[ID] = {
  session: 'Level 6 · Session recap · 06/07/2026',
  blurb: 'In the blood pool of his own compound the Pig nearly drowns Arthas before they bring him down. Under the cave lies Stagford, a drowned dead city; the last prisoner wears Severin’s face, and Lucien pours her elixir out alone. Then the church, and their father, the High Inquisitor, who says nothing.',
  length: '6 min', audio: 'levels/06-' + ID + '.mp3',
  packs: ['nature', 'village', 'beasts'],
  doorAt: 5.0,
  titles: TITLES,
  cues: CUES, keys: KEYS, duration: DURATION, silenceT: 336, lineTimes: LINE_TIMES, beats: BEATS,
  clearings, shots,
  build(X) { return SCENES.map((f) => f(X)).filter(Boolean); }
};
})(typeof window !== 'undefined' ? window : globalThis);
