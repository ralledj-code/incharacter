/* Level 1: Alaron, the First Steps. The first session: Lucien sings how he met everyone.
   The Blackbird (the tavern hub) -> the guild township -> the harbour (Silas, the guild's men, the dice, the pier)
   -> chorus road (wolves and merchants) -> the warehouse (the half-brothers, Silas turns, the merchants storm in)
   -> chorus road with the brothers -> the square (church business, Silas bound) -> Severin in the pines -> the dying fire.
   Lyrics: Whisper transcript, names fixed by Rasmus (Severin, Silas = Lucien's drug contact). Beats: scripts/beats.py (140.7 BPM). */
(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, ss, M, bx, cy, cn, ic, part, solid, emis, inst, lamb, R, pick } = C;
const ID = 'first-steps';
const DURATION = 288.96;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

const CHORUS = ['Alaron, Alaron, the night don’t forgive me,', 'Brother’s blood and a stranger’s design,', 'I walk where the wolves and the merchants collide,', 'And I carry the weight,', 'It is mine'];
const CUES = [
  { id: 'intro', t: 0, v: 0.5, motes: 'dust', stamp: '', lines: ['Sit close now, the fire is dying,', 'I’ll sing you the truth of tonight,', 'Of dice and of drugs and of brothers,', 'Of a name that don’t sit right'] },
  { id: 'v1', t: 44.8, v: 2.2, motes: 'dust', stamp: 'The Blackbird', lines: ['I played for the crowd at the Blackbird,', 'Strings ringing, the ale flowing free,', 'But the tradesmen have swallowed the township,', 'There’s fewer coins falling for me', 'My shipment sits late by the harbour,', 'Silas holds what’s owed to my hand,', 'I’ll walk to the docks in the evening', 'And collect what’s mine on demand'] },
  { id: 'v1b', t: 75.5, v: 0.8, motes: 'dust', stamp: 'the docks', lines: ['Two men came in shouting for payment,', 'Faces red with the trade guild’s greed,', 'I showed them the dice, sweet and loaded,', 'Told them next week, and they agreed,', 'They left cursing, but left all the same'] },
  { id: 'pre', t: 96.0, v: 1.2, motes: 'fireflies', stamp: '', lines: ['Oh, the mysteries pile like the coin I don’t have,', 'And the debts of a man never sleep,', 'I’m the bastard who smiles while he’s bleeding,', 'And the secrets I bury run deep'] },
  { id: 'chorus', t: 110.7, v: 2.4, motes: 'embers', stamp: '', lines: CHORUS },
  { id: 'v2', t: 130.3, v: 1.0, motes: 'dust', stamp: 'the warehouse', lines: ['I found my half-brothers waiting,', 'Arthas and Cedric Cold-Eye,', 'They wanted me gone from the doorstep,', 'But our business was tangled inside,', 'Then Silas began to unravel,', 'Fur breaking skin, eyes gone wild,', 'He tore through a man in the shadows,', 'And the warehouse ran red for a while'] },
  { id: 'v2b', t: 156.9, v: 0.5, motes: 'ash', stamp: '', lines: ['I got my seven doses, one for each morning,', 'Though I don’t know what comes after that,', 'Then the armed merchants stormed through the doorway,', 'Sure that we’d murdered where their brother sat,', 'I froze one dead with an ice-shard whisper,', 'Arthas broke one with a single blow,', 'The survivors fled into darkness,', 'Now the hunters may hunt us, I know'] },
  { id: 'chorus2', t: 187.1, v: 2.4, motes: 'embers', stamp: '', lines: CHORUS },
  { id: 'inst', t: 201.5, v: 2.0, motes: 'sparks', stamp: '', lines: [] },
  { id: 'bridge', t: 213.6, v: 1.0, motes: 'sparks', stamp: 'the square', lines: ['I told the crowd it was church business, bright,', 'Lied through my teeth to keep the peace tight,', 'Arthas won’t look me in the eye tonight,', 'Another debt I’ve bought with my lies,', 'We bound Silas, broke through his mind,', 'And there in the dark of what we’d find,', 'He’d seen Severin where the woodline waits,', 'She promised him something past the gates'] },
  { id: 'hum', t: 243.4, v: 1.1, motes: 'fireflies', stamp: '', lines: ['I don’t know what, I don’t know what,', 'I don’t know what…'] },
  { id: 'outro', t: 258.8, v: 0.45, motes: 'smoke', stamp: 'the fire', lines: ['She’s out there still in the black of the pines,', 'A promise unspoken, a debt undefined,', 'The fire’s gone low and my brothers won’t speak,', 'And I don’t know what she wants', 'Or what she seeks'] },
  { id: 'final', t: 279.0, v: 0.12, motes: 'ash', stamp: '', lines: [] }
];
const LINE_TIMES = [3.42, 8.5, 12.8, 17.12, 45.32, 48.72, 51.76, 55.62, 58.74, 62.32, 65.76, 69.12, 76.06, 79.34, 82.44, 85.08, 89.36, 96.52, 100.4, 102.92, 106.52, 111.2, 114.4, 117.34, 120.74, 123.32, 130.82, 133.7, 137, 140.74, 143.66, 147.22, 150.82, 154.16, 157.42, 160.88, 164.1, 167.74, 170.82, 174.99, 177.66, 181.44, 187.64, 191, 193.92, 197.32, 199.9, 214.12, 217.8, 221.26, 224.24, 227.36, 230.68, 233.94, 237.38, 243.9, 247.6, 259.34, 263.26, 266.44, 269.7, 274.32];
const BEATS = {"bpm":140.7,"beats":[0.22,0.62,1.04,1.41,1.81,2.19,2.67,3.15,3.52,3.89,4.29,4.56,4.8,5.14,5.63,6.16,6.7,7.01,7.39,7.81,8.24,8.66,9.07,9.31,9.86,10.22,10.67,11.01,11.25,11.78,12.22,12.67,13.14,13.44,13.76,14.03,14.43,14.7,15.1,15.39,15.66,16.02,16.4,16.88,17.36,17.84,18.26,18.66,19.07,19.41,19.73,20.05,20.56,20.94,21.39,21.86,22.4,23.04,23.46,23.89,24.32,24.75,25.17,25.46,25.74,26.02,26.45,26.88,27.15,27.44,27.73,28.14,28.58,28.99,29.28,29.84,30.27,30.7,31.12,31.55,31.97,32.26,32.54,32.8,33.25,33.68,34.11,34.53,34.96,35.39,35.81,36.22,36.66,37.07,37.36,37.65,37.92,38.21,38.5,38.77,39.06,39.6,40.05,40.48,40.9,41.33,41.74,42.18,42.61,42.9,43.46,43.87,44.3,44.74,45.15,45.58,45.87,46.3,46.72,47.3,47.71,47.97,48.38,48.75,48.99,49.36,49.84,50.26,50.5,50.83,51.12,51.54,51.97,52.38,52.82,53.06,53.66,53.97,54.53,54.9,55.25,55.52,55.79,56.22,56.56,57.07,57.5,57.92,58.35,58.78,59.2,59.62,59.86,60.48,60.75,61.15,61.47,61.76,62.18,62.61,63.04,63.46,63.89,64.3,64.74,65.17,65.58,66.02,66.43,66.86,67.15,67.7,67.95,68.29,68.56,68.99,69.41,69.65,70.05,70.43,70.69,71.12,71.54,71.97,72.4,72.77,73.23,73.66,74.1,74.51,74.94,75.38,75.79,76.22,76.51,77.07,77.42,77.82,78.35,78.75,79.2,79.63,79.94,80.21,80.48,80.91,81.23,81.71,82.18,82.61,83.04,83.44,83.86,84.3,84.74,85.12,85.41,85.82,86.18,86.43,86.86,87.28,87.71,88.13,88.56,88.99,89.42,89.84,90.27,90.62,91.12,91.54,91.97,92.4,92.82,93.18,93.76,94.1,94.53,94.94,95.38,95.79,96.22,96.64,97.07,97.49,97.92,98.35,98.78,99.15,99.63,100.05,100.48,100.9,101.33,101.76,102.18,102.61,103.04,103.46,103.89,104.3,104.74,105.17,105.58,106.02,106.43,106.86,107.28,107.71,108.16,108.54,108.85,109.15,109.41,109.84,110.13,110.4,110.69,110.98,111.54,111.95,112.38,112.82,113.2,113.66,114.1,114.51,114.94,115.36,115.79,116.22,116.61,117.07,117.49,117.92,118.35,118.78,119.2,119.62,120.05,120.48,120.9,121.33,121.74,122.18,122.61,123.02,123.28,123.87,124.11,124.38,124.72,125.15,125.58,126,126.43,126.85,127.28,127.7,128.13,128.56,128.98,129.41,129.84,130.26,130.69,131.1,131.39,131.73,131.97,132.4,132.82,133.25,133.66,134.1,134.38,134.83,135.25,135.79,136.22,136.66,137.07,137.5,137.92,138.35,138.77,139.2,139.63,140.05,140.48,140.9,141.33,141.74,142.18,142.58,142.9,143.18,143.46,143.89,144.3,144.74,145.15,145.58,146.02,146.43,146.86,147.28,147.57,147.97,148.26,148.56,148.99,149.41,149.82,150.27,150.69,151.1,151.36,151.89,152.4,152.82,153.23,153.66,154.1,154.51,154.94,155.36,155.79,156.22,156.64,157.07,157.5,157.92,158.34,158.77,159.2,159.63,160.05,160.48,160.9,161.33,161.76,162.18,162.46,162.77,163.04,163.42,163.7,164.02,164.3,164.72,165.15,165.58,166,166.43,166.72,167.26,167.71,168.13,168.56,168.98,169.41,169.84,170.26,170.69,171.1,171.54,171.97,172.38,172.82,173.23,173.66,174.1,174.51,174.94,175.36,175.79,176.22,176.64,176.93,177.5,177.92,178.35,178.77,179.2,179.62,180.05,180.48,180.88,181.33,181.74,182.18,182.61,182.85,183.17,183.46,183.71,184.02,184.3,184.72,185.18,185.65,186,186.43,186.85,187.28,187.71,188.13,188.56,188.98,189.41,189.79,190.26,190.69,191.1,191.54,191.95,192.38,192.82,193.22,193.66,194.08,194.51,194.93,195.36,195.79,196.21,196.64,197.06,197.49,197.86,198.34,198.77,199.2,199.62,199.87,200.43,200.74,200.98,201.31,201.74,202.02,202.3,202.59,203.02,203.3,203.58,203.87,204.14,204.43,204.72,205.15,205.57,205.86,206.14,206.43,206.7,207.14,207.71,208.13,208.56,208.98,209.41,209.84,210.26,210.69,211.1,211.54,211.97,212.38,212.82,213.23,213.66,213.95,214.24,214.51,214.8,215.3,215.65,216,216.37,216.62,216.86,217.14,217.47,217.78,218.34,218.72,219.17,219.68,220,220.29,220.88,221.28,221.76,222.08,222.5,222.78,223.31,223.65,224.18,224.5,224.75,225.17,225.47,226.02,226.26,226.64,226.88,227.3,227.73,228.14,228.58,229.01,229.44,229.86,230.29,230.69,231.14,231.57,231.97,232.42,232.83,233.12,233.41,233.7,234.05,234.35,234.62,234.98,235.39,235.82,236.24,236.67,237.1,237.52,237.95,238.21,238.8,239.09,239.36,239.65,239.94,240.22,240.46,240.78,241.07,241.34,241.63,241.92,242.16,242.48,242.77,243.06,243.34,243.62,243.9,244.18,244.72,245.12,245.39,245.84,246.4,246.85,247.28,247.73,248.16,248.58,249.01,249.42,249.86,250.27,250.7,251.14,251.55,251.98,252.42,252.83,253.26,253.68,254.11,254.53,254.96,255.39,255.81,256.24,256.67,257.09,257.5,257.94,258.37,258.78,259.22,259.65,260.08,260.48,260.91,261.34,261.76,262.19,262.61,263.04,263.47,263.89,264.32,264.75,265.17,265.6,266.03,266.45,266.88,267.3,267.73,268.16,268.58,269.01,269.42,269.86,270.29,270.7,271.14,271.55,271.98,272.42,272.85,273.23,273.58,274,274.45,274.9,275.25,275.6,276.02,276.26,276.69,277.1,277.54,277.97,278.38,278.82,279.23,279.66,280.1,280.53,280.94,281.38,281.81,282.22,282.66,283.09,283.57,284.05,284.54,284.93,285.31,285.73,286.08,286.5,286.96,287.42,287.97,288.38,288.85],"bars":[1.04,2.67,4.29,5.63,7.39,9.07,10.67,12.22,13.76,15.1,16.4,18.26,19.73,21.39,23.46,25.17,26.45,27.73,29.28,31.12,32.54,34.11,35.81,37.36,38.5,40.05,41.74,43.46,45.15,46.72,48.38,49.84,51.12,52.82,54.53,55.79,57.5,59.2,60.75,62.18,63.89,65.58,67.15,68.56,70.05,71.54,73.23,74.94,76.51,78.35,79.94,81.23,83.04,84.74,86.18,87.71,89.42,91.12,92.82,94.53,96.22,97.92,99.63,101.33,103.04,104.74,106.43,108.16,109.41,110.69,112.38,114.1,115.79,117.49,119.2,120.9,122.61,124.11,125.58,127.28,128.98,130.69,131.97,133.66,135.25,137.07,138.77,140.48,142.18,143.46,145.15,146.86,148.26,149.82,151.36,153.23,154.94,156.64,158.34,160.05,161.76,163.04,164.3,166,167.71,169.41,171.1,172.82,174.51,176.22,177.92,179.62,181.33,182.85,184.02,185.65,187.28,188.98,190.69,192.38,194.08,195.79,197.49,199.2,200.74,202.02,203.3,204.43,205.86,207.14,208.98,210.69,212.38,213.95,215.3,216.62,217.78,219.68,221.28,222.78,224.5,226.02,227.3,229.01,230.69,232.42,233.7,234.98,236.67,238.21,239.65,240.78,241.92,243.06,244.18,245.84,247.73,249.42,251.14,252.83,254.53,256.24,257.94,259.65,261.34,263.04,264.75,266.45,268.16,269.86,271.55,273.23,274.9,276.26,277.97,279.66,281.38,283.09,284.93,286.5,288.38],"hits":[13.76,14.7,19.41,23.89,31.55,40.05,40.48,40.9,41.33,41.74,42.18,42.61,43.46,43.87,44.3,44.74,45.15,45.58,49.22,52.38,52.82,59.2,62.18,67.7,69.41,76.22,79.2,79.63,86.72,96.22,103.46,109.41,110.69,123.28,124.72,125.15,125.58,126,126.43,126.85,127.28,128.56,129.41,130.26,131.1,135.79,137.5,137.92,141.74,144.3,146.43,147.28,154.51,157.92,160.9,164.3,201.31,202.59,203.87,204.72,205.15,206,206.43,208.98,209.41,210.26,210.69,211.54,212.38,212.82,213.23,213.66,215.3,216.86,217.78,219.17,220,222.78,278.38,278.82,279.23,279.66,280.1,280.53,280.94,281.38,281.81,282.22,282.66]};

C.defineMood('township', 0x2a1c22, 0.022, 0x141a34, 0xb0603a, 0xffc090, 0x2a1c18, 0.85, 0xffb070, 0.8, 0xffb860, 1.6, 0x2a2018, 0.3, 0.2, 0);
C.defineMood('harbour', 0x0e1828, 0.024, 0x040814, 0x1a3050, 0x7a98c8, 0x101820, 0.75, 0xa8c0f0, 0.6, 0xffb870, 1.6, 0x161e28, 1, 1, 0);
C.defineMood('warehouse', 0x140e0a, 0.026, 0x06070a, 0x161210, 0xd8b088, 0x2a1a10, 0.8, 0xffc890, 0.3, 0xffb060, 1.5, 0x1e1610, 0, 0, 0);
C.defineMood('pines', 0x08100e, 0.036, 0x020504, 0x0c1a16, 0x5a7a70, 0x0a100e, 0.6, 0x90b0a8, 0.35, 0xb0ffd0, 1.2, 0x0e1412, 0.6, 0.4, 0.5, 0x40ffa0, 0x60ffd0);
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 51.6, m: 'township', b: 1.0 }, { t: 58.5, m: 'harbour', b: 4 }, { t: 110.7, m: 'chorus', b: 3 },
  { t: 131, m: 'warehouse', b: 3 }, { t: 151.5, m: 'wellRed', b: 1.5 }, { t: 158, m: 'warehouse', b: 3 }, { t: 171.2, m: 'well', b: 0.6 },
  { t: 174.6, m: 'warehouse', b: 1.5 }, { t: 187.1, m: 'chorus', b: 3 }, { t: 202, m: 'cross', b: 4 }, { t: 213.6, m: 'march', b: 3 },
  { t: 230.9, m: 'dagger', b: 2 }, { t: 234.5, m: 'pines', b: 3 }, { t: 259.3, m: 'camp', b: 4 }, { t: 281, m: 'black', b: 5 }
];
// name cards, the first time each of them is on screen (ui.js `titles`)
const TITLES = [
  { t: 9.0, name: 'Lucien Vale', sub: 'half-elf · wild magic sorcerer · the one singing' },
  { t: 45.4, name: 'The Blackbird', sub: 'a tavern in the township' },
  { t: 62.4, name: 'Silas', sub: 'Lucien’s contact for his drugs' },
  { t: 133.5, name: 'Arthas', sub: 'devout paladin · Lucien’s half-brother', dur: 3.2 },
  { t: 136.8, name: 'Cedric', sub: 'monk · Lucien’s half-brother', dur: 3.2 },
  { t: 234.2, name: 'Severin', sub: 'a name that don’t sit right' }
];

/* shared story kit (w3d_story.js) */
const { chars, put, railPts, corpse, severin } = C.lib;

const SCENES = [
  /* ---- the guild township: stalls and banners, Lucien busking for coins ---- */
  function township(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
    const dA = 6, dH0 = X.distAt(58.0), dB = dH0 - 9;
    // cobbles down the street
    const cob = C.tex('cobblestone_floor_04_diff', 2, 8);
    for (let d = dA; d < dH0 + 2; d += 6) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 6.4), new THREE.MeshLambertMaterial({ color: 0x8a7a6a, map: cob || null }));
      const p = X.at(d + 3, 0, 0.015); m.position.copy(p); m.rotation.set(-Math.PI / 2, 0, X.yawAt(d + 3)); g.add(m);
    }
    const street = [];
    for (let d = dA + 2; d < dH0 - 2; d += 8.2) {
      [-1, 1].forEach((sg) => {
        const w = pick([4, 6]), dep = 6, p = X.at(d + R(-0.6, 0.6), sg * (8.6 + w * 0.15), 0), hs = kit.house({ w, d: dep, h: 5, wall: 0x6a5444, roof: 0x3a2a2e });
        hs.position.copy(p); kit.placeFacing(hs, d, sg);
        street.push({ x: p.x, z: p.z, yaw: hs.rotation.y, w, d: dep, st: R(0, 1) < 0.5 ? 2 : 1, brick: R(0, 1) < 0.3, box: hs });
      });
    }
    const vil = kit.village(street); if (vil) g.add(vil); else street.forEach((s) => g.add(s.box));
    // the guild has the street: red banners and stalls, keepers behind every one
    const keepers = [];
    for (let d = dA + 5, i = 0; d < dB - 2; d += 7.5, i++) {
      const sg = i % 2 ? 1 : -1, p = X.at(d, sg * 4.6, 0), yaw = X.yawAt(d) + (sg > 0 ? -Math.PI / 2 : Math.PI / 2);
      put(g, i % 3 === 2 ? 'Stall_Cart_Empty' : 'Stall_Empty', p, yaw, 2.6);
      put(g, 'Crate_Wooden', X.at(d + 1.6, sg * 5.4, 0), yaw + 0.3, 0.7);
      const bnr = put(g, i % 2 ? 'Banner_1' : 'Banner_2', X.at(d + 3.5, sg * 6.8, 0), yaw, 3.2);
      if (bnr) bnr.traverse((m) => { if (m.isMesh && m.material && !/Wood|Metal/i.test(m.material.name)) { m.material = m.material.clone(); m.material.color.setHex(0x8a1c1c); } });
      const k = ch.person({ seed: 40 + i * 5, tint: pick([0x7a2020, 0x8a3a2a, 0x6a2a3a]), pose: i % 2 ? 'Idle_Talking_Loop' : 'Idle_Loop' });
      k.position.copy(X.at(d, sg * 5.6, 0)); k.rotation.y = yaw; g.add(k); keepers.push(k);
    }
    // townsfolk walking the street (actors), both ways
    const walkers = [];
    for (let i = 0; i < (X.mobile ? 4 : 7); i++) {
      const sg = i % 2 ? 1 : -1, fwd = i % 3 !== 0, a = dA + 6 + i * 4.5, b = a + (fwd ? 14 : -10), lane = sg * (fwd ? 1.5 : 2.5);
      const w = ch.person({ seed: 90 + i * 11 }); w.position.copy(X.at(a, lane, 0)); g.add(w);
      walkers.push(C.act(w, [{ t: 0, face: X.at(b, 0, 0) }, { t: 49 + i * 0.7, to: railPts(X, a, b, lane), speed: R(1.0, 1.4) }]));
    }
    // Lucien busks at the bottom of the street, lute on his back; a coin, then nothing
    const lu = ch.lucien({ pose: 'Idle_Loop' }); lu.position.copy(X.at(dB, 3.1, 0)); g.add(lu);
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    const lute = C.creature('lute', { h: 0.85 }); if (lute) C.attach(lu, 'spine_03', lute, [0.05, -0.05, -0.2], [0.3, Math.PI, 1.15]);
    const hat = solid([cy(0.2, 0.17, 0.09, 10, 0x2a1a14, [0, 0.045, 0]), cy(0.26, 0.26, 0.012, 12, 0x2a1a14, [0, 0.006, 0])]);
    hat.position.copy(X.at(dB + 0.9, 2.3, 0)); g.add(hat);
    const coin = X.glow(0xffd060, 0.3, 0); g.add(coin);
    X.anchors.busk = lu; X.anchors.street = g; X.anchors.hat = hat;
    const actors = [C.act(lu, [{ t: 0, pose: 'Idle_Talking_Loop', face: X.at(dB, -3, 0) }, { t: L(7, -0.5), pose: 'Idle_Loop', face: hat }, { t: 60, show: false }])];
    X.anchors.luTown = lu;
    return {
      group: g, d0: 0, d1: dH0 + 4, vis: 100,
      update(t, ctx) {
        walkers.concat(actors).forEach((a) => a.update(t, ctx));
        const u = t - L(7, 0.6);  // one coin falls into the hat
        const hp = hat.position; coin.material.opacity = u > 0 && u < 1.6 ? 0.95 * (1 - u / 1.6) : 0;
        coin.position.set(hp.x, Math.max(0.1, 1.5 - 2.4 * u * u), hp.z);
        if (t > 50 && t < 70) ctx.light(0, hp.x, 3.2, hp.z, 0xffb060, 1.6, 22);
      }
    };
  },

  /* ---- the harbour: Silas, the guild's two men and the loaded dice, then the pier ---- */
  function harbour(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
    const dH0 = X.distAt(58.0), dH1 = X.sec.pre.d1 + 6, dSil = X.distAt(L(9)) + 7, dT = dSil + 8, dP = dT + 7;
    // black water to the left, a stone quay edge, mooring posts; the berth is empty (the shipment is late)
    const water = new THREE.MeshLambertMaterial({ color: 0x0a1624, emissive: 0x030a14 });
    for (let d = dH0 - 8; d < dH1 + 30; d += 6) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 140), water); const p = X.at(d, -77, 0.03); m.position.copy(p); m.rotation.set(-Math.PI / 2, 0, X.yawAt(d) + Math.PI / 2); g.add(m);
    }
    const quay = [], posts = [];
    for (let d = dH0 - 6; d < dH1 + 30; d += 6) {
      const p = X.at(d, -7.1, 0.16), yaw = X.yawAt(d);
      quay.push(bx(6.3, 0.36, 0.9, 0x5a5a62, [p.x, 0.16, p.z], [0, yaw, 0]));
      const q = X.at(d + 2, -7.5, 0); posts.push(cy(0.16, 0.18, 1.0, 6, 0x3a2a1c, [q.x, 0.5, q.z]));
    }
    g.add(solid(quay.concat(posts)));
    // moon on the water
    const glints = []; for (let i = 0; i < 9; i++) { const s = X.glow(0x9ab8ff, R(1, 2.4), 0.25); s.position.copy(X.at(R(dH0, dH1), R(-14, -60), 0.1)); g.add(s); glints.push(s); }
    // Silas's shed, crates stacked for a ship that hasn't come
    const sp = X.at(dSil, 9.6, 0), shedH = { x: sp.x, z: sp.z, yaw: X.yawAt(dSil) - Math.PI / 2, w: 6, d: 6, st: 1, brick: true };
    const vil = kit.village([shedH], { glass: 0xffa850 }); if (vil) g.add(vil); else { const b = kit.house({ w: 6, d: 6, h: 4 }); b.position.copy(sp); b.rotation.y = shedH.yaw; g.add(b); }
    for (let i = 0; i < 6; i++) put(g, i % 3 ? 'Crate_Wooden' : 'Barrel', X.at(dSil + 4.5 + (i % 3) * 1.1, 5.2 + Math.floor(i / 3) * 1.1, 0), R(0, 1), i % 3 ? 0.9 : 1.0);
    put(g, 'Crate_Wooden', X.at(dSil + 5.0, 5.7, 0.9), 0.4, 0.8);
    const lamps = [X.at(dSil - 2, 6.4, 2.6), X.at(dT, -5.6, 2.2), X.at(dP + 0.5, -17.5, 1.6)];
    lamps.forEach((p, i) => { const l = X.glow(0xffb060, 2.4, 0.85); l.position.copy(p); g.add(l); g.add(solid([cy(0.04, 0.05, p.y, 5, 0x2a2a30, [p.x, p.y / 2, p.z])])); });
    // the table on the quay: the dice
    const tp = X.at(dT, -4.4, 0); put(g, 'Table_Large', tp, X.yawAt(dT), 0.85); put(g, 'Mug', X.at(dT + 0.4, -4.3, 0.85), 0, 0.14); put(g, 'Stool', X.at(dT, -3.5, 0), 0, 0.5);
    const dice = new THREE.Group(); [[-0.08, 0], [0.09, 0.05]].forEach(([x, z], i) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), new THREE.MeshLambertMaterial({ color: 0xf2ece0, emissive: 0x302820 })); c.position.set(x, 0.035, z); c.rotation.y = i * 0.7; dice.add(c); });
    const dg = X.glow(0xfff0c0, 0.7, 0); dg.position.y = 0.05; dice.add(dg); dice.position.copy(X.at(dT - 0.2, -4.2, 0.86)); g.add(dice); X.anchors.dice = dice;
    // the pier
    const pier = [];
    const pa = X.at(dP, -6.6, 0), pb = X.at(dP, -18.5, 0), pyaw = Math.atan2(pb.x - pa.x, pb.z - pa.z);
    for (let k = 0; k <= 12; k++) { const u = k / 12, x = lerp(pa.x, pb.x, u), z = lerp(pa.z, pb.z, u); pier.push(bx(2.4, 0.08, 0.95, 0x5a4332, [x, 0.08, z], [0, pyaw, 0])); if (k % 3 === 0) { [-1.1, 1.1].forEach((o) => pier.push(cy(0.1, 0.1, 0.9, 5, 0x3a2a1c, [x + Math.cos(pyaw) * o, -0.2, z - Math.sin(pyaw) * o]))); } }
    g.add(solid(pier)); X.anchors.pierEnd = new THREE.Object3D(); X.anchors.pierEnd.position.copy(pb); g.add(X.anchors.pierEnd);

    // people
    const lu = ch.lucien({ pose: 'Idle_Loop' }); g.add(lu); lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    const lute = C.creature('lute', { h: 0.85 }); if (lute) C.attach(lu, 'spine_03', lute, [0.05, -0.05, -0.2], [0.3, Math.PI, 1.15]);
    const sil = ch.person({ seed: 5150, female: false, outfit: 'peasant', tint: 0x3a3a30, hair: 'hair_buzzed', hairTint: 0x2a1c14, pose: 'Idle_Loop' }); sil.userData.label = 'silas';
    sil.position.copy(X.at(dSil, 6.2, 0)); g.add(sil); X.anchors.silas = sil;
    const dB = dH0 - 9, l0 = X.at(dB, 3.1, 0);  // where Lucien busked in the street
    lu.position.copy(l0);
    const men = [0, 1].map((i) => { const m = ch.person({ seed: 600 + i * 31, female: false, outfit: 'ranger', tint: i ? 0x8a2222 : 0x7a1a2a, pose: 'Idle_Talking_Loop' }); m.userData.label = 'guildman'; g.add(m); return m; });
    men[0].position.copy(X.at(dT - 16, -1.2, 0)); men[1].position.copy(X.at(dT - 17, 0.4, 0));
    const silSpot = X.at(dSil - 1.0, 4.4, 0), tableSpot = X.at(dT, -3.3, 0);
    const actors = [
      C.act(lu, [{ t: 0, show: false }, { t: 60, show: true, pose: 'Idle_Loop', face: X.at(dSil, 5, 0) },
        { t: 60.4, to: railPts(X, dB, dSil - 3.5, 3.1).concat([silSpot]), by: L(11, 0.8) },     // "I'll walk to the docks in the evening"
        { t: L(11, 0.8), pose: 'Idle_Talking_Loop', face: sil },                                     // "and collect what's mine"
        { t: 72.6, to: [X.at(dSil + 3, 1.2, 0), X.at(dT - 0.5, -1.5, 0), tableSpot], by: 76.4 },
        { t: 76.4, pose: 'Idle_Loop', face: X.at(dT - 6, -1, 0) },
        { t: L(14, -0.2), pose: 'Idle_Talking_Loop', face: dice },                                    // "I showed them the dice"
        { t: L(16, 1.2), to: [X.at(dT + 2.5, -4.2, 0), X.at(dP - 0.4, -6.8, 0.12), X.at(dP, -10, 0.12), X.at(dP, -17.6, 0.12)], by: L(18) },  // to the end of the pier
        { t: L(18), pose: 'Idle_Loop', face: X.at(dP + 2, -40, 0) },
        { t: L(19, -0.2), pose: 'Idle_Talking_Loop', face: X.at(dP - 4, -6, 0) },                   // the bastard who smiles
        { t: L(20), pose: 'Idle_Loop', face: X.at(dP + 2, -40, 0) }], { ignoreGround: true }),
      C.act(sil, [{ t: 0, pose: 'Idle_Loop', face: X.at(dSil - 4, 0, 0) }, { t: L(11), pose: 'Idle_Talking_Loop', face: lu }, { t: 74, to: X.at(dSil + 2.2, 8.0, 0), move: 2.4 }, { t: 77, show: false }]),
      C.act(men[0], [{ t: 0, show: false }, { t: 70, show: true, face: lu }, { t: 72.5, to: X.at(dT - 1.4, -2.2, 0), by: L(12, 0.8) }, { t: L(12, 0.8), pose: 'Idle_Talking_Loop', face: lu },
        { t: L(16), to: railPts(X, dT - 1.4, dT - 22, -0.6), speed: 1.4 }, { t: 98, show: false }]),
      C.act(men[1], [{ t: 0, show: false }, { t: 70, show: true, face: lu }, { t: 72.8, to: X.at(dT + 0.6, -2.0, 0), by: L(12, 1.2) }, { t: L(12, 1.2), pose: 'Idle_Talking_Loop', face: lu },
        { t: L(16, 0.4), to: [X.at(dT - 1, -0.4, 0)].concat(railPts(X, dT - 2, dT - 22, 0.9)), speed: 1.3 }, { t: 98, show: false }])
    ];
    X.anchors.luHarbour = lu; X.anchors.guild0 = men[0]; X.anchors.guild1 = men[1]; X.anchors.table = new THREE.Object3D(); X.anchors.table.position.copy(tp); g.add(X.anchors.table);
    const coins = []; for (let i = 0; i < 5; i++) { const c = X.glow(0xffd060, 0.22, 0); g.add(c); coins.push(c); }
    return {
      group: g, d0: dH0 - 10, d1: dH1, vis: 100,
      update(t, ctx) {
        actors.forEach((a) => a.update(t, ctx));
        glints.forEach((s, i) => { s.material.opacity = 0.12 + 0.12 * Math.sin(ctx.time * 1.3 + i * 1.7); });
        const dk = ss(L(14, -0.2), L(14, 0.4), t) * (1 - ss(L(16), L(16, 1), t)); dg.material.opacity = 0.8 * dk; dice.visible = t > L(14, -0.4);
        dice.rotation.y = 0.4 * ss(L(14), L(14, 0.8), t);
        // the coins he doesn't have: dropped off the pier, one at a time
        const hand = pb;
        coins.forEach((c, i) => { const u = t - L(17, 4.6) - i * 0.45; c.material.opacity = u > 0 && u < 1.3 ? 0.9 : 0; c.position.set(hand.x + Math.sin(i * 2.1) * 0.8 - 0.6, Math.max(0.05, 1.3 - 4.9 * u * u), hand.z + Math.cos(i * 2.1) * 0.5 - 0.4); });
        ctx.light(1, lamps[1].x, 2.4, lamps[1].z, 0xffb060, 1.8, 18);
        if (t > L(17)) ctx.light(0, pb.x, 2.0, pb.z, 0x9ab8ff, 1.4, 16);
      }
    };
  },

  /* ---- the chorus roads: wolves in the trees to the left, merchants (later hunters) to the right ---- */
  function chorus1(X) { return chorusRoad(X, 'chorus', 21, false); },

  /* ---- the warehouse: the brothers at the door, Silas turns, the merchants storm in ---- */
  function warehouse(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
    const S = X.sec.v2, dW = X.distAt(L(28)) + 2, dBack = X.sec.v2b.d1 + 6, LW = Math.max(26, dBack - dW);
    g.add(kit.trees(S.d0 - 30, S.d0 - 4, { minSide: 10, maxSide: 30, dens: 0.6, deadP: 0.3, tint: 0x6a7080 }));
    const wh = new THREE.Group(); wh.position.copy(X.at(dW, 0, 0)); wh.rotation.y = X.yawAt(dW) + Math.PI; g.add(wh);  // local +z = along the rail (deeper inside)
    const WH = 5.6, HW = 7.5, plank = C.tex('wood_plank_wall_diff', 4, 1.5), floorT = C.tex('old_wood_floor_diff', 4, 8);
    const wallM = new THREE.MeshLambertMaterial({ color: 0x8a7a6a, map: plank || null, side: THREE.DoubleSide });
    const wall = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM); m.position.set(x, y, z); m.rotation.y = ry || 0; wh.add(m); return m; };
    wall(LW, WH, -HW, WH / 2, LW / 2, Math.PI / 2); wall(LW, WH, HW, WH / 2, LW / 2, -Math.PI / 2);
    [0, LW].forEach((z) => { wall(HW - 2.4, WH, -(HW + 2.4) / 2, WH / 2, z); wall(HW - 2.4, WH, (HW + 2.4) / 2, WH / 2, z); wall(4.8, WH - 3.8, 0, 3.8 + (WH - 3.8) / 2, z); });
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, LW), new THREE.MeshLambertMaterial({ color: 0x2a201a, side: THREE.DoubleSide })); roof.rotation.x = Math.PI / 2; roof.position.set(0, WH, LW / 2); wh.add(roof);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, LW), new THREE.MeshLambertMaterial({ color: 0x7a6a5a, map: floorT || null })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, LW / 2); wh.add(fl);
    const beams = []; for (let z = 3; z < LW; z += 5) { beams.push(bx(HW * 2, 0.3, 0.3, 0x3a2a1c, [0, WH - 0.2, z])); [-HW + 0.3, HW - 0.3].forEach((x) => beams.push(bx(0.3, WH, 0.3, 0x3a2a1c, [x, WH / 2, z]))); }
    wh.add(solid(beams));
    // crates and barrels along both walls, lanterns
    for (let z = 2; z < LW - 2; z += 2.4) [-1, 1].forEach((sg, k) => {
      if ((z * 7 + k * 3) % 5 < 1) return;
      const n = 1 + ((z * 3 + k) % 3 | 0);
      for (let j = 0; j < n; j++) put(wh, j % 2 ? 'Barrel' : 'Crate_Wooden', V3(sg * (HW - 1.0 - (j % 2) * 1.1), j > 1 ? 0.9 : 0, z + (j % 2) * 0.4), R(0, 1), 0.9);
    });
    const lantern = [V3(-3, 3.2, 5), V3(3, 3.2, 12), V3(-2, 3.2, 19)].map((p) => { const l = X.glow(0xffb060, 2.4, 0.9); l.position.copy(p); wh.add(l); wh.add(solid([cy(0.01, 0.01, WH - p.y, 4, 0x222222, [p.x, (WH + p.y) / 2, p.z])])); return p; });
    // the doses: seven vials on a crate
    const crate = put(wh, 'Crate_Wooden', V3(-3.2, 0, 6.5), 0.2, 0.8);
    const vials = []; for (let i = 0; i < 7; i++) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.13, 6), new THREE.MeshBasicMaterial({ color: 0xc070ff })); v.position.set(-3.45 + i * 0.08, 0.86, 6.5 + (i % 2) * 0.06); wh.add(v); vials.push(v); }
    const vg = X.glow(0xb060ff, 1.2, 0.6); vg.position.set(-3.2, 1.0, 6.5); wh.add(vg);

    // the cast (local coordinates: x across, z inward from the front door)
    const lu = ch.lucien({ pose: 'Idle_Loop' }), art = ch.arthas({ pose: 'Idle_Loop' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    const sil = ch.person({ seed: 5150, female: false, outfit: 'peasant', tint: 0x3a3a30, hair: 'hair_buzzed', hairTint: 0x2a1c14, pose: 'Idle_Talking_Loop' }); sil.userData.label = 'silas';
    const clerk = ch.person({ seed: 909, female: false, outfit: 'peasant', tint: 0x7a2a2a, pose: 'Idle_Loop' }); clerk.userData.label = 'clerk';
    const wolf = C.creature('wolf', { h: 1.45, tint: 0x2a2220, eyes: 0xff2a10 }); if (wolf) { wolf.userData.label = 'silas-beast'; X.anims.push(wolf); }
    [lu, art, ced, sil, clerk, wolf].forEach((o) => o && wh.add(o));
    lu.position.set(0.3, 0, -16); art.position.set(-1.3, 0, -2.6); ced.position.set(1.3, 0, -2.4); sil.position.set(1.6, 0, 9); clerk.position.set(-3.8, 0, 15.5);
    if (wolf) wolf.position.set(1.6, 0, 9);
    const merch = [0, 1, 2, 3].map((i) => {
      const m = ch.person({ seed: 1200 + i * 17, female: false, outfit: 'ranger', tint: pick([0x7a1a1a, 0x8a2a20, 0x6a1a2a]), pose: 'Sword_Idle' }); m.userData.label = 'merchant' + i;
      const sw = put(new THREE.Group(), 'Sword_Bronze', V3(0, 0, 0), 0, 0.95); if (sw) C.attach(m, 'hand_r', sw, [0, 0.02, 0.02], [Math.PI / 2, 0, 0]);
      m.position.set(-1.5 + i, 0, -6 - i * 0.6); wh.add(m); return m;
    });
    const body = corpse(ch, 909, 0x7a2a2a); if (body) { body.position.set(-3.6, 0, 15.2); body.rotation.y = 0.6; wh.add(body); }
    const fallen = corpse(ch, 1200 + 17, 0x8a2a20); if (fallen) { fallen.position.set(0.5, 0, 3.8); fallen.rotation.y = Math.PI; wh.add(fallen); }
    // the frozen one: his own body in ice
    const iceM = new THREE.MeshLambertMaterial({ color: 0xa8e0ff, emissive: 0x284a6a, transparent: true, opacity: 0.92 });
    let ice = null; { const p = ch.person({ bake: true, seed: 1200, female: false, outfit: 'ranger', tint: 0x7a1a1a }); const b = p && p.userData.mixer && C.bakeRig(p, 'Sword_Idle', 0.3); if (b) { b.traverse((m) => { if (m.isMesh) m.material = iceM; }); ice = new THREE.Group(); ice.add(b); const sh = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; sh.push(cn(0.12, R(0.5, 1.1), 5, 0xc8f0ff, [Math.cos(a) * 0.35, 0.3, Math.sin(a) * 0.35], [Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4])); } ice.add(solid(sh)); wh.add(ice); } }
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xa8e8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(beam);
    const iceG = X.glow(0x90d8ff, 2.2, 0); g.add(iceG);
    const slash = X.glow(0xfff0c0, 1.6, 0); g.add(slash);
    const flash = X.glow(0xff3020, 5, 0); flash.position.set(1.6, 1.0, 9); wh.add(flash);

    const P = (x, z) => V3(x, 0, z), F = (x, z) => P(x, z);
    const turnT = L(31), tearT = L(32), dosesT = L(34), stormT = L(36), freezeT = L(38, 0.4), blowT = L(39, 0.1), fleeT = L(40);
    const actors = [
      // Lucien comes up the quay to his brothers at the door, they block him, then all go in
      C.act(lu, [{ t: 0, face: P(0, 0) }, { t: 129.2, to: [P(0.3, -12), P(0.2, -4.6)], by: L(26, 1.6) },
        { t: L(26, 1.6), pose: 'Idle_Talking_Loop', face: art },
        { t: L(29), to: [P(0.2, -1), P(0, 3), P(-0.6, 6.4)], by: L(29, 4) },                                                  // "our business was tangled inside"
        { t: L(29, 4), pose: 'Idle_Talking_Loop', face: sil },
        { t: L(31, 0.4), to: P(-1.2, 5.2), move: 0.9, back: true }, { t: L(31, 1.3), pose: 'Spell_Simple_Idle_Loop', face: P(1.6, 9) },  // backs off from the beast
        { t: dosesT - 1.0, to: P(-3.2, 5.9), by: dosesT + 0.3 }, { t: dosesT + 0.3, pose: 'Crouch_Idle_Loop', face: P(-3.2, 6.5) },  // "seven doses"
        { t: L(35, 0.6), pose: 'Idle_Loop', face: P(0, 0) },
        { t: stormT + 0.6, to: P(-1.6, 7.2), move: 1.2 }, { t: stormT + 1.8, pose: 'Idle_Loop', face: P(-0.5, 2.6) },
        { t: L(38, -0.3), pose: 'Spell_Simple_Idle_Loop', face: P(-1.5, 3.0) },                                              // the ice-shard whisper
        { t: fleeT + 1, pose: 'Idle_Loop', face: P(0, -6) }]),
      C.act(art, [{ t: 0, pose: 'Idle_Loop', face: P(0, -10) }, { t: L(28, -0.2), to: P(-0.4, -3.4), move: 1.2 }, { t: L(28, 1.0), pose: 'Sword_Idle', face: lu },  // "wanted me gone from the doorstep"
        { t: L(29, 0.6), to: [P(-0.6, 0), P(-1.4, 6.0)], by: L(29, 4.4) }, { t: L(29, 4.4), pose: 'Idle_Loop', face: sil },
        { t: turnT + 0.6, pose: 'Sword_Idle', face: P(1.6, 9) },
        { t: stormT + 0.8, to: P(0.2, 6.6), move: 1.0 }, { t: stormT + 1.8, pose: 'Sword_Idle', face: P(0.5, 3.0) },
        { t: blowT - 0.5, to: P(0.5, 4.6), move: 0.5 }, { t: blowT, pose: 'Sword_Idle', face: P(0.5, 3.0) }]),                          // "Arthas broke one with a single blow"
      C.act(ced, [{ t: 0, pose: 'Idle_Loop', face: P(0, -10) }, { t: L(28, 0.3), pose: 'Idle_Loop', face: lu },
        { t: L(29, 1.0), to: [P(1.0, 0), P(1.2, 5.8)], by: L(29, 4.6) }, { t: L(29, 4.6), pose: 'Idle_Loop', face: sil },
        { t: turnT + 0.8, pose: 'Sword_Idle', face: P(1.6, 9) },
        { t: stormT + 0.8, to: P(2.4, 6.8), move: 1.0 }, { t: stormT + 1.8, pose: 'Idle_Loop', face: P(2.4, 2.4) }]),
      C.act(sil, [{ t: 0, pose: 'Idle_Talking_Loop', face: P(0, 4) }, { t: L(30), pose: 'Fixing_Kneeling', face: P(0, 4) }, { t: L(31, 0.15), show: false }]),   // "Silas began to unravel"
      C.act(clerk, [{ t: 0, pose: 'Idle_Loop', face: P(0, 9) }, { t: tearT + 0.5, pose: 'Idle_Loop', face: P(1.6, 9) }, { t: tearT + 1.1, show: false }]),
      wolf && C.act(wolf, [{ t: 0, show: false }, { t: L(31, 0.15), show: true, pose: 'Attack', face: P(-0.6, 6) },                            // "fur breaking skin"
        { t: L(31, 1.6), pose: 'Idle_2_HeadLow', face: P(-0.6, 6) },
        { t: tearT - 0.4, to: P(-3.0, 14.4), move: 1.3 }, { t: tearT + 0.9, pose: 'Attack', face: P(-3.8, 15.5) },                                    // "tore through a man"
        { t: tearT + 1.8, pose: 'Eating', face: P(-3.6, 15.4) },
        { t: stormT + 0.3, to: [P(-1.5, 18), P(0, LW - 1), P(0, LW + 14)], speed: 6 }, { t: stormT + 4, show: false }],                      // it bolts out the back as they storm in
      { gait: [['Walk', 0.69], ['Gallop', 2.57]], idle: 'Idle' }),
      // the merchants storm in through the front door
      ...merch.map((m, i) => C.act(m, [{ t: 0, show: false }, { t: stormT - 1, show: true, face: P(0, 8) },
        { t: stormT, to: [P(-1.5 + i, -2), P([-1.5, -0.6, 0.6, 1.8][i], [3.0, 2.6, 3.0, 2.4][i])], by: stormT + 3.1 },
        { t: stormT + 3.1, pose: i === 1 ? 'Idle_Talking_Loop' : 'Sword_Idle', face: P(0, 7) },
        i === 0 ? { t: freezeT, show: false } :
          i === 1 ? { t: blowT, to: P(0.5, 3.6), move: 0.35, back: true } :
            { t: fleeT + i * 0.3, to: [P(-1 + i, -3), P(-1 + i * 1.5, -20)], speed: 4.4 },
        i === 1 ? { t: blowT + 0.4, show: false } : i > 1 ? { t: fleeT + 5, show: false } : { t: 999, show: false }]))
    ].filter(Boolean);
    X.anchors.wh = wh; X.anchors.luWh = lu; X.anchors.arthasWh = art; X.anchors.cedricWh = ced; X.anchors.silasWh = sil; X.anchors.beast = wolf || sil; X.anchors.clerk = clerk;
    X.anchors.vials = vg; X.anchors.merch0 = merch[0]; X.anchors.merch1 = merch[1];
    const whp = (x, y, z) => wh.localToWorld(V3(x, y, z));
    return {
      group: g, d0: S.d0 - 12, d1: dBack + 6, vis: 100,
      update(t, ctx) {
        actors.forEach((a) => a.update(t, ctx));
        if (wolf) wolf.visible = wolf.visible && t > L(31) && t < stormT + 4;
        vials.forEach((v, i) => { v.visible = t < dosesT + 0.6 + i * 0.4; });
        vg.material.opacity = t < dosesT + 3.4 ? 0.6 : 0;
        if (body) body.visible = t > tearT + 1.1;
        if (fallen) fallen.visible = t > blowT + 0.4;
        if (ice) { ice.visible = t > freezeT; ice.position.set(-1.5, 0, 3.0); ice.rotation.y = 0; }
        flash.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - L(31, 0.15)) / 0.5) + 0.5 * Math.max(0, 1 - Math.abs(t - tearT - 1) / 0.6);
        // the ice ray: from Lucien's hand to the first merchant
        const ub = t - L(38, -0.1), on = ub > 0 && ub < 1.1;
        beam.material.opacity = on ? 0.85 * Math.sin(Math.PI * ub / 1.1) : 0;
        if (on) {
          const a = whp(-1.6, 1.35, 7.0), b = whp(-1.5, 1.3, 3.0), mid = a.clone().add(b).multiplyScalar(0.5);
          beam.position.copy(mid); beam.scale.set(1, a.distanceTo(b), 1); beam.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize());
        }
        iceG.position.copy(whp(-1.5, 1.2, 3.0)); iceG.material.opacity = t > freezeT ? 0.5 + 0.4 * Math.max(0, 1 - (t - freezeT) / 1.5) : 0;
        slash.position.copy(whp(0.5, 1.3, 3.8)); slash.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - blowT) / 0.35);
        const lp = whp(lantern[0].x, lantern[0].y, lantern[0].z), lq = whp(lantern[1].x, lantern[1].y, lantern[1].z);
        const red = ss(L(32, 0.8), L(33), t) * (1 - ss(L(34), L(34, 2), t));
        ctx.light(0, lp.x, lp.y, lp.z, red > 0.05 ? 0xff3020 : 0xffb060, 1.8 + red, 20);
        ctx.light(1, lq.x, lq.y, lq.z, t > freezeT - 0.4 && t < freezeT + 2 ? 0x80d0ff : 0xffb060, 1.6, 20);
      }
    };
  },

  function chorus2(X) { return chorusRoad(X, 'chorus2', 42, true); },

  /* ---- the square: church business, Arthas turns away, Silas bound in a chair ---- */
  function square(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
    const S = X.sec.bridge, dQ = S.d0 + 7;
    // a few houses round a square, torches
    const hs = [];
    [[-4, -1], [10, -1], [22, -1], [-2, 1], [26, 1]].forEach(([o, sg]) => { const p = X.at(dQ + o, sg * 15, 0); hs.push({ x: p.x, z: p.z, yaw: X.yawAt(dQ + o) + (sg > 0 ? -Math.PI / 2 : Math.PI / 2), w: 6, d: 6, st: 2, brick: o > 15 }); });
    const vil = kit.village(hs); if (vil) g.add(vil);
    const cob = C.tex('cobblestone_floor_04_diff', 6, 6);
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(26, 34), new THREE.MeshLambertMaterial({ color: 0x8a7a6a, map: cob || null })); sq.rotation.set(-Math.PI / 2, 0, X.yawAt(dQ + 8)); sq.position.copy(X.at(dQ + 8, 2, 0.015)); g.add(sq);
    const tl = [X.at(dQ - 2, 4.5, 0), X.at(dQ + 6, 12, 0), X.at(dQ + 14, 4.5, 0), X.at(dQ + 10, -7, 0)].map((p) => ({ x: p.x, z: p.z }));
    const tor = kit.torches(tl, { glow: 0xffc070, size: 3.4, op: 0.85 }); g.add(tor.group);
    // the crowd: townsfolk, some with torches (real rigs, frozen and instanced)
    const ring = X.at(dQ + 5, 7.5, 0), cr = [];
    for (let i = 0; i < (X.mobile ? 16 : 26); i++) { const a = -1.3 + (i / 25) * 2.6, r = R(3.0, 6.0); const p = ring.clone().add(V3(0, 0, 0)); const yaw = X.yawAt(dQ + 5) - Math.PI / 2 + a; p.x += Math.sin(yaw) * r; p.z += Math.cos(yaw) * r; cr.push({ p, yaw: yaw + Math.PI }); }
    const VAR = ch.person ? 4 : 0, baked = [];
    for (let k = 0; k < VAR; k++) { const p = ch.person({ bake: true, seed: 2000 + k * 13 }); if (p.userData.mixer) baked.push(C.bakeRig(p, k % 2 ? 'Idle_Torch_Loop' : 'Idle_Loop', 0.3 + k * 0.2)); }
    baked.forEach((b, k) => { const mats = cr.filter((c, i) => i % baked.length === k).map((c) => M([c.p.x, 0, c.p.z], [0, c.yaw, 0], 1)); const im = C.instObject(b, mats); if (im) g.add(im); });
    const flames = []; cr.forEach((c, i) => { if (baked.length && i % baked.length === 1) { const f = X.glow(0xffa040, 1.0, 0.8); f.position.set(c.p.x + Math.sin(c.yaw - 0.4) * 0.35, 2.0, c.p.z + Math.cos(c.yaw - 0.4) * 0.35); g.add(f); flames.push(f); } });
    // the party
    const lu = ch.lucien({ pose: 'Idle_Talking_Loop' }), art = ch.arthas({ pose: 'Idle_Loop' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    [lu, art, ced].forEach((o) => g.add(o));
    lu.position.copy(X.at(dQ + 5, 3.4, 0)); art.position.copy(X.at(dQ + 3.4, 1.6, 0)); ced.position.copy(X.at(dQ + 6.6, 1.4, 0));
    // Silas on a crate, roped
    const cp = X.at(dQ + 13, -4.2, 0); put(g, 'Crate_Wooden', cp, 0.3, 0.55);
    const sil = ch.person({ seed: 5150, female: false, outfit: 'peasant', tint: 0x3a3a30, hair: 'hair_buzzed', hairTint: 0x2a1c14, pose: 'Sitting_Idle_Loop' }); sil.userData.label = 'silas';
    sil.position.copy(cp); g.add(sil);
    const ropes = new THREE.Group(); [1.0, 1.2].forEach((y) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 4, 14), new THREE.MeshLambertMaterial({ color: 0x8a7050 })); r.rotation.x = Math.PI / 2; r.position.y = y; ropes.add(r); }); ropes.position.copy(cp); g.add(ropes);
    const mind = X.glow(0xb070ff, 1.6, 0); g.add(mind);
    const actors = [
      C.act(lu, [{ t: 0, pose: 'Idle_Talking_Loop', face: ring }, { t: L(50), pose: 'Idle_Loop', face: art },
        { t: L(50, 0.2), to: X.at(dQ + 12.6, -2.6, 0), by: L(51, -0.2) }, { t: L(51, -0.2), pose: 'Spell_Simple_Idle_Loop', face: sil }]),   // "we bound Silas, broke through his mind"
      C.act(art, [{ t: 0, pose: 'Idle_Loop', face: ring }, { t: L(49, -0.3), to: [X.at(dQ + 4, -1.2, 0), X.at(dQ + 9.5, -4.5, 0)], move: 3.4 }, { t: L(49, 3.1), pose: 'Idle_Loop', face: X.at(dQ + 16, -12, 0) },  // won't look me in the eye
        { t: L(51, 1.6), pose: 'Idle_Loop', face: sil }]),
      C.act(ced, [{ t: 0, pose: 'Idle_Loop', face: ring }, { t: L(51, -1.4), to: X.at(dQ + 14.2, -2.4, 0), move: 2.4 }, { t: L(51, 1.0), pose: 'Idle_Loop', face: sil }]),
      C.act(sil, [{ t: 0, pose: 'Sitting_Idle_Loop', face: X.at(dQ + 10, 0, 0) }])
    ];
    X.anchors.luSquare = lu; X.anchors.arthasSquare = art; X.anchors.crowd = new THREE.Object3D(); X.anchors.crowd.position.copy(ring); g.add(X.anchors.crowd); X.anchors.silasBound = sil;
    return {
      group: g, d0: S.d0 - 6, d1: S.d1 + 4, vis: 100,
      update(t, ctx) {
        tor.update(ctx.time); actors.forEach((a) => a.update(t, ctx));
        flames.forEach((f, i) => { f.material.opacity = 0.65 + 0.2 * Math.sin(ctx.time * 11 + i); });
        const m = ss(L(51, 0.4), L(51, 1.6), t) * (1 - ss(L(53), L(53, 1), t)); mind.position.set(cp.x, 1.6, cp.z); mind.material.opacity = m * (0.6 + 0.3 * Math.sin(ctx.time * 6));
        ctx.light(1, cp.x, 2.0, cp.z, 0xb070ff, 2.4 * m, 14);
        ctx.light(0, ring.x, 3, ring.z, 0xffa040, 1.8, 22);
      }
    };
  },

  /* ---- Severin in the pines, and the gate she promised ---- */
  function pines(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
    const S = X.sec.hum, dV = S.d0 + 6, dG = dV + 5;
    g.add(kit.trees(X.sec.bridge.d1 - 4, X.sec.outro.d0 + 4, { minSide: 4.5, maxSide: 34, dens: 1.5, deadP: 0.15, tint: 0x5a7a70 }));
    const G = new THREE.Group(); G.position.copy(X.at(dG, 0, 0)); G.rotation.y = X.yawAt(dG); g.add(G);
    const st = 0x4a5450;
    G.add(solid([bx(1.0, 4.6, 1.0, st, [-2.6, 2.3, 0]), bx(1.0, 3.6, 1.0, st, [2.6, 1.8, 0], [0, 0, -0.08]), bx(6.6, 0.8, 1.1, st, [0, 4.7, 0], [0, 0, 0.05]),
      bx(1.2, 0.5, 1.2, st, [-2.6, 0.25, 0]), ic(0.6, 0, st, [3.6, 0.3, 0.6])]));
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshBasicMaterial({ color: 0x60ffc0, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    veil.position.set(0, 2.2, 0); G.add(veil);
    const vg = X.glow(0x60ffc0, 7, 0); vg.position.set(0, 2.2, -1); G.add(vg);
    const sev = severin(X, ch); sev.position.copy(X.at(dG - 2.2, 0.4, 0)); g.add(sev);
    const actors = [C.act(sev, [{ t: 0, show: false }, { t: 232.5, show: true, pose: 'Idle_Loop', face: X.at(dV - 10, 0, 0) },
      { t: L(54, -0.1), pose: 'Spell_Simple_Idle_Loop', face: X.at(dV - 10, 0, 0) },                                   // "she promised him something past the gates"
      { t: L(56, 1.5), to: [X.at(dG - 0.6, 0, 0), X.at(dG + 2.5, 0, 0)], speed: 0.9 }, { t: 258.2, show: false }])];
    X.anchors.severin = sev; X.anchors.gate = G;
    return {
      group: g, d0: X.sec.bridge.d1 - 10, d1: X.sec.outro.d0 + 4, vis: 100,
      update(t, ctx) {
        actors.forEach((a) => a.update(t, ctx));
        const open = ss(L(54), L(54, 2), t) * (1 - ss(257, 259, t));
        veil.material.opacity = 0.12 + 0.3 * open * (0.8 + 0.2 * Math.sin(ctx.time * 3)); vg.material.opacity = 0.2 + 0.6 * open;
        sev.userData.aura.material.opacity = 0.18 + 0.12 * Math.sin(ctx.time * 2.2);
        const gp = G.position; ctx.light(0, gp.x, 2.4, gp.z, 0x60ffc0, 0.6 + 2.2 * open, 26);
      }
    };
  },

  /* ---- the dying fire: three brothers who don't speak ---- */
  function camp(X) {
    const kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
    const S = X.sec.outro, dC = S.d0 + 9, fp = X.at(dC, 4.2, 0);
    g.add(kit.trees(S.d0 - 6, S.d1 + 30, { minSide: 9, maxSide: 36, dens: 1.3, deadP: 0.2, tint: 0x6a7a80 }));
    const fire = kit.fire({ scale: 1.3, size: 6 }); fire.group.position.set(fp.x, 0.1, fp.z); g.add(fire.group);
    const stones = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; stones.push(ic(0.26, 0, 0x5c6068, [fp.x + Math.cos(a) * 0.95, 0.12, fp.z + Math.sin(a) * 0.95], [1, 0.7, 1])); }
    g.add(solid(stones));
    const fP = V3(fp.x, 0, fp.z), seat = (a, r) => fP.clone().add(V3(Math.cos(a) * r, 0, Math.sin(a) * r));
    const yaw0 = X.yawAt(dC);
    const lu = ch.lucien({ pose: 'Sitting_Idle_Loop' }), art = ch.arthas({ pose: 'Sitting_Idle_Loop' }), ced = ch.cedric({ pose: 'Sitting_Idle_Loop', noStaff: true });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    lu.position.copy(seat(-yaw0 + Math.PI, 2.0)); art.position.copy(seat(-yaw0 + 0.9, 2.1)); ced.position.copy(seat(-yaw0 - 0.9, 2.1));
    [lu, art, ced].forEach((o) => g.add(o));
    // logs to sit on
    g.add(solid([lu, art, ced].map((o) => { const v = o.position.clone().sub(fP); return cy(0.2, 0.22, 1.3, 7, 0x3a2a1c, [o.position.x - v.x * 0.06, 0.2, o.position.z - v.z * 0.06], [Math.PI / 2, 0, Math.atan2(v.x, v.z)]); })));
    const actors = [
      C.act(lu, [{ t: 0, pose: 'Sitting_Idle_Loop', face: fP }, { t: L(57, 1), pose: 'Sitting_Idle_Loop', face: X.at(dC + 24, 16, 0) }, { t: L(59), pose: 'Sitting_Idle_Loop', face: fP }]),
      C.act(art, [{ t: 0, pose: 'Sitting_Idle_Loop', face: art.position.clone().multiplyScalar(2).sub(fP) }]),   // his back to Lucien
      C.act(ced, [{ t: 0, pose: 'Sitting_Idle_Loop', face: fP }])
    ];
    // her eyes in the woodline
    const eyes = [-0.12, 0.12].map((x) => { const e = X.glow(0xb0ffe0, 0.35, 0); const p = X.at(dC + 24, 16 + x, 1.62); e.position.copy(p); g.add(e); return e; });
    X.anchors.fire = fire.group; X.anchors.luCamp = lu; X.anchors.arthasCamp = art; X.anchors.cedricCamp = ced; X.anchors.woodEyes = eyes[0];
    let k = 1;
    return {
      group: g, d0: S.d0 - 6, d1: S.d1 + 30, vis: 100,
      update(t, ctx) {
        actors.forEach((a) => a.update(t, ctx)); fire.update(ctx.time);
        k = 1 - 0.75 * ss(L(59), 284, t); fire.group.scale.setScalar(Math.max(0.05, k));        // "the fire's gone low"
        const e = ss(L(57), L(57, 1.5), t) * (1 - ss(L(58, 2), L(58, 3.5), t)) + 0.6 * ss(L(61), L(61, 1), t) * (1 - ss(282, 284, t));
        eyes.forEach((s) => { s.material.opacity = 0.9 * e; });
        ctx.light(1, fp.x, 1.2, fp.z, 0xff9a40, 2.8 * k * fire.flicker(ctx.time), 22);
      }
    };
  }
];

/* the chorus roads (both choruses; the second with the brothers and the hunters' torches) */
function chorusRoad(X, secId, line0, brothers) {
  const S = X.sec[secId], kit = C.kit(X), ch = chars(X), g = new THREE.Group(), L = X.line;
  const dEnd = brothers ? X.sec.inst.d1 + 4 : S.d1 + 4;
  g.add(kit.trees(S.d0 - 8, dEnd, { minSide: 9, maxSide: 38, dens: 1.1, deadP: 0.2, tint: 0x9080b0 }));
  // the road
  for (let d = S.d0 - 6; d < dEnd; d += 6) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 6.4), new THREE.MeshLambertMaterial({ color: 0x3a3034 })); m.position.copy(X.at(d + 3, 0, 0.012)); m.rotation.set(-Math.PI / 2, 0, X.yawAt(d + 3)); g.add(m); }
  const dS = S.d0 + 10, dStop = dS + (L(line0 + 3) - S.t0) * 1.15;
  // wolves pacing the trees on the left, eyes lit
  const wolves = [];
  for (let i = 0; i < (X.mobile ? 3 : 5); i++) {
    const w = C.creature('wolf', { h: 0.95, tint: 0x3a3438, eyes: 0xff2a10 }); if (!w) break;
    w.userData.label = 'wolf'; X.anims.push(w); g.add(w);
    const sd = -R(7.5, 11), a = dS - 6 + i * 3.2; w.position.copy(X.at(a, sd, 0));
    wolves.push(C.act(w, [{ t: 0, face: X.at(a + 5, sd, 0) }, { t: S.t0 + i * 0.4, to: railPts(X, a, a + (dStop - dS) + 4, sd), by: L(line0 + 3, 0.5) }, { t: L(line0 + 3, 0.5), pose: 'Idle_2_HeadLow', face: X.at(dStop, 0, 0) }],
      { gait: [['Walk', 0.69], ['Gallop', 2.57]], idle: 'Idle' }));
  }
  // merchants (chorus 1) or hunters with torches (chorus 2) on the right
  const torches = [], mp = [];
  for (let i = 0; i < (X.mobile ? 3 : 5); i++) {
    const p = ch.person({ seed: (brothers ? 3100 : 3000) + i * 9, female: false, tint: pick([0x7a1a1a, 0x8a3a2a, 0x5a2a2a]), pose: brothers || i % 2 ? 'Idle_Torch_Loop' : 'Idle_Loop' });
    const d = dS + 2 + i * ((dStop - dS) / 4.5), sd = R(7, 10); p.position.copy(X.at(d, sd, 0)); p.lookAt(X.at(d - 2, 0, 0)); g.add(p); mp.push(p);
    if (brothers || i % 2) { const f = X.glow(0xffa040, 1.3, 0.85); f.position.copy(X.at(d - 0.3, sd - 0.4, 2.0)); g.add(f); torches.push(f); }
  }
  if (!brothers) { put(g, 'Prop_Wagon', X.at(dS + (dStop - dS) * 0.55, 9.5, 0), X.yawAt(dS) + 0.3, 2.2); put(g, 'Barrel', X.at(dS + (dStop - dS) * 0.55 + 2.6, 8, 0), 0, 1.0); }
  // Lucien walks the road between them (with his brothers the second time), stops, turns: "it is mine"
  const lu = ch.lucien({ pose: 'Idle_Loop' }); lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false; g.add(lu); lu.position.copy(X.at(dS, 0, 0));
  const cast = [lu], acts = [];
  acts.push(C.act(lu, [{ t: 0, face: X.at(dS + 4, 0, 0) }, { t: S.t0 + 0.2, to: railPts(X, dS, dStop, 0), by: L(line0 + 3) },
    { t: L(line0 + 3), pose: 'Idle_Loop', face: X.at(dStop - 10, 0, 0) },
    { t: L(line0 + 4, -0.2), pose: 'Spell_Simple_Idle_Loop', face: X.at(dStop - 10, 0, 0) }]));
  if (brothers) {
    [['arthas', -1.5], ['cedric', 1.5]].forEach(([who, sd]) => {
      const b = ch[who]({ pose: 'Idle_Loop' }); g.add(b); b.position.copy(X.at(dS - 1.4, sd, 0)); cast.push(b);
      acts.push(C.act(b, [{ t: 0, face: X.at(dS + 4, sd, 0) }, { t: S.t0 + 0.4, to: railPts(X, dS - 1.4, dStop - 1.4, sd), by: L(line0 + 3, 0.3) }, { t: L(line0 + 3, 0.3), pose: who === 'arthas' ? 'Sword_Idle' : 'Idle_Loop', face: X.at(dStop - 10, sd, 0) }]));
    });
  }
  // the stranger's design: a pale figure in the trees, there and gone
  const sev = severin(X, ch); sev.position.copy(X.at(dS + (dStop - dS) * 0.5, 15, 0)); g.add(sev);
  acts.push(C.act(sev, [{ t: 0, show: false }, { t: L(line0 + 1, -0.2), show: true, face: X.at(dS + (dStop - dS) * 0.5, 0, 0) }, { t: L(line0 + 2, -0.3), show: false }]));
  X.anchors['lu_' + secId] = lu; X.anchors['sev_' + secId] = sev; X.anchors['wolf_' + secId] = wolves.length ? g.children.find((o) => o.userData.label === 'wolf') : lu;
  X.anchors['merch_' + secId] = mp[2] || lu;
  if (brothers) { X.anchors.arthas_c2 = cast[1]; X.anchors.cedric_c2 = cast[2]; }
  return {
    group: g, d0: S.d0 - 8, d1: dEnd, vis: 100,
    update(t, ctx) {
      wolves.concat(acts).forEach((a) => a.update(t, ctx));
      torches.forEach((f, i) => { f.material.opacity = 0.7 + 0.2 * Math.sin(ctx.time * 12 + i * 2); });
      const p = lu.getWorldPosition(new THREE.Vector3());
      ctx.light(1, p.x, 2.2, p.z, 0xb070ff, 1.2 + 2.2 * ss(L(line0 + 4, -0.3), L(line0 + 4, 0.4), t), 14);
    }
  };
}

/* no trees where the camera works */
function clearings(X) {
  const c = (d, side, r) => { const p = X.at(d, side, 0); return { x: p.x, z: p.z, r }; }, S = X.sec;
  return [c(S.chorus.d0 + 18, 0, 6), c(S.chorus2.d0 + 18, 0, 6), c(S.hum.d0 + 4, 0, 9), c(S.hum.d0 + 11, 0, 8), c(S.outro.d0 + 9, 4.2, 9),
    c(S.v2.d0 + 6, 0, 10), c(S.chorus.d0 + 4, 0, 6), c(S.chorus2.d0 + 4, 0, 6)];
}

/* the music video */
function shots(X, D) {
  const A = X.anchors, H = X.hubAnchors, L = X.line, P = D.p, d = D.dAt;
  const wp = (o) => (o ? (o.isVector3 ? o.clone() : o.getWorldPosition(new THREE.Vector3())) : X.at(X.distAt(0) + 30, 0, 0));
  const near = (o, dx, dy, dz) => () => wp(o).add(V3(dx, dy, dz));
  const lu = H.lucien || V3(0, 0.45, -8.55), bros = () => (H.cedric ? wp(H.cedric) : V3(-2, 0, -4.6));
  const whp = (x, y, z) => () => A.wh.localToWorld(V3(x, y, z));
  const dSil = X.distAt(L(9)) + 7, dT = dSil + 8, dP = dT + 7, dH0 = X.distAt(58.0), dB = dH0 - 9;
  const fire = V3(-5.2, 0.9, -2.5), dGate = X.sec.hum.d0 + 11;
  // a camera between someone at the fire and the flames, a little to the side
  const campCam = (o, side, h, k) => () => { const f = wp(A.fire), p = wp(o), v = f.clone().sub(p).setY(0); const q = p.clone().addScaledVector(v, k === undefined ? 0.42 : k); q.x += -v.z * side * 0.4; q.z += v.x * side * 0.4; q.y = h; return q; };
  return [
    // the Blackbird: the fire, Lucien, the brothers at their table
    { t: 0, cam: D.fixed(V3(0.4, 2.7, 3.6), V3(0, 1.6, -8.6), { push: 0.15, fov: 55 }) },
    { t: L(0, -0.3), cam: D.fixed(V3(-1.8, 1.6, 0.6), fire, { push: 0.25, fov: 46 }) },                                  // "sit close now, the fire is dying"
    { t: L(1, -0.3), cam: D.orbit(lu, { r: 3.0, h: 1.8, a0: 0.9, w: 0.08, t0: L(1), lookH: 1.5, fov: 46 }) },                      // Lucien Vale
    { t: L(2, -0.3), cam: D.orbit(bros, { r: 2.6, h: 1.1, a0: 0.2, w: 0.12, t0: L(2), lookH: 1.0, fov: 52 }) },                     // "of dice and of drugs and of brothers"
    { t: L(3, -0.3), cam: D.fixed(V3(0.2, 1.7, -5.4), near(lu, 0, 1.55, 0), { push: 0.25, fov: 40 }) },                             // "a name that don't sit right"
    { t: 21.4, cam: D.dolly(V3(4.2, 2.6, 2.0), V3(-4.2, 2.6, 2.0), V3(0, 1.4, -6), { fov: 62 }) },
    { t: 29.3, cam: D.orbit(lu, { r: 4.5, r1: 3.2, h: 3.2, h1: 1.6, a0: -0.8, w: -0.06, t0: 29.3, lookH: 1.3, fov: 55 }) },
    { t: 37.4, cam: D.dolly(V3(-4.2, 2.2, 1.6), V3(-2.4, 2.2, -0.6), bros, { fov: 55 }) },
    { t: L(4, -0.3), cam: D.fixed(V3(3.6, 3.4, 1.4), V3(-0.5, 1.0, -4.5), { push: 0.3, fov: 64 }) },                                // "I played for the crowd at the Blackbird"
    { t: L(5, -0.3), cam: D.orbit(lu, { r: 2.0, h: 1.4, a0: 0.4, w: 0.12, t0: L(5), lookH: 1.3, fov: 44 }) },                       // "strings ringing"
    { t: 50.4, cam: D.dolly(V3(0.6, 2.4, -6.6), V3(0, 2.0, -11.4), V3(0, 1.9, -16), { lookB: P(30, 0, 2), fov: 60, fov1: 72 }) },  // out the back door
    // the township
    { t: L(6, -0.2), blend: 0.6, cam: D.dolly(P(10, 0, 3.2), P(24, 0, 2.6), P(36, 0, 1.6), { linear: true, fov: 68 }) },            // "the tradesmen have swallowed the township"
    { t: L(7, -0.3), cam: D.orbit(A.luTown, { r: 2.8, h: 1.2, a0: -1.2, w: 0.1, t0: L(7), lookH: 0.8, fov: 50 }) },                  // "fewer coins falling for me"
    { t: L(8, -0.3), cam: D.dolly(P(dB - 6, 0, 4), P(dH0 + 6, -2, 2.4), P(dH0 + 24, -12, 0.5), { fov: 64 }) },                    // "my shipment sits late by the harbour"
    { t: L(9, -0.3), cam: D.fixed(P(dSil - 3.2, 2.6, 1.7), near(A.silas, 0, 1.5, 0), { push: 0.25, fov: 40 }) },                 // Silas
    { t: L(10, -0.2), cam: D.track(A.luHarbour, { offset: [0.6, 1.6, 2.8], lookOffset: [0, 1.4, 0], fov: 50 }) },                   // "I'll walk to the docks"
    { t: L(11, 0.4), smooth: 2, cam: D.orbit(() => wp(A.luHarbour).lerp(wp(A.silas), 0.5), { r: 3.6, h: 1.6, a0: 2.6, w: 0.1, t0: L(11), lookH: 1.4, fov: 52 }) },
    // the guild's men and the dice
    { t: 73.0, cam: D.track(A.guild0, { offset: [-1.2, 1.7, -2.6], lookOffset: [0, 1.2, 4], fov: 58 }) },
    { t: L(12, -0.2), cam: D.orbit(A.table, { r: 3.6, h: 1.8, a0: 0.4, w: 0.07, t0: L(12), lookH: 1.3, fov: 55 }) },               // "two men came in shouting"
    { t: L(13, -0.2), cam: D.orbit(A.guild1, { r: 2.3, h: 1.6, a0: 0.3, w: 0.08, t0: L(13), lookH: 1.6, fov: 42 }) },           // "faces red with the trade guild's greed"
    { t: L(14, -0.2), cam: D.orbit(A.dice, { r: 0.75, h: 0.4, a0: 2.2, w: 0.25, t0: L(14), lookH: 0, fov: 46 }) },                   // the dice
    { t: L(15, -0.2), cam: D.orbit(A.luHarbour, { r: 2.2, h: 1.6, a0: -0.4, w: 0.1, t0: L(15), lookH: 1.5, fov: 44 }) },             // "told them next week"
    { t: L(16, -0.2), cam: D.fixed(P(dT + 6, -1, 2.0), near(A.guild0, 0, 1.2, 0), { fov: 55 }) },                                // "they left cursing"
    // the pier
    { t: L(17, -0.4), smooth: 2, cam: D.track(A.luHarbour, { offset: [-2.2, 2.2, -3.6], lookOffset: [0, 1.0, 5], fov: 60 }) },
    { t: L(18, -0.2), cam: D.orbit(A.pierEnd, { r: 9, h: 2.2, a0: 1.9, w: 0.06, t0: L(18), lookH: 1.2, fov: 52 }) },                  // "the debts of a man never sleep"
    { t: L(19, -0.3), cam: D.fixed(near(A.pierEnd, 1.4, 1.65, 1.1), near(A.pierEnd, 0, 1.6, 0), { push: 0.15, fov: 38 }) },          // "the bastard who smiles while he's bleeding"
    { t: L(20, -0.2), cam: D.dolly(near(A.pierEnd, -1.2, 2.6, -2.5), near(A.pierEnd, -2.6, 0.25, -4.0), near(A.pierEnd, -3, -0.5, -8), { fov: 60 }) },  // the secrets run deep
    // chorus 1
    { t: 110.7, cam: D.dolly(P(d(110.7) - 4, 0, 14), P(d(110.7) + 12, 0, 6), () => X.at(X.sec.chorus.d0 + 26, 0, 1.2), { fov: 66 }) },  // "Alaron, Alaron"
    { t: L(22, -0.3), cam: D.fixed(near(A.lu_chorus, -1.8, 2.0, 0), near(A.sev_chorus, 0, 1.4, 0), { push: 0.35, fov: 32 }) },        // the stranger's design
    { t: L(23, -0.3), cam: D.track(A.lu_chorus, { offset: [0.8, 1.6, 3.2], lookOffset: [0, 1.4, 0], fov: 60 }) },                     // "where the wolves and the merchants collide"
    { t: L(23, 1.6), cam: D.track(A.wolf_chorus, { offset: [1.6, 0.6, 1.6], lookOffset: [0, 0.5, 0], fov: 52 }) },
    { t: L(24, -0.3), cam: D.track(A.lu_chorus, { offset: [-0.4, 1.6, 2.0], lookOffset: [0, 1.5, 0], fov: 44 }) },                    // "and I carry the weight"
    { t: L(25, -0.2), cam: D.orbit(A.lu_chorus, { r: 4, r1: 11, h: 1.4, h1: 8, a0: 0, w: 0.2, t0: L(25), lookH: 1.2, fov: 58 }) },     // "it is mine"
    // the warehouse
    { t: 128.4, cam: D.fixed(whp(4, 3.0, -9), whp(0, 1.4, -1), { push: 0.15, fov: 58 }) },
    { t: L(26, -0.3), cam: D.track(A.luWh, { offset: [-0.8, 1.7, -2.4], lookOffset: [0, 1.2, 5], fov: 55 }) },                       // "I found my half-brothers waiting"
    { t: L(27, -0.3), cam: D.fixed(whp(-0.9, 1.4, -5.0), near(A.arthasWh, 0, 1.6, 0), { push: 0.2, fov: 40 }) },                    // Arthas
    { t: L(27, 2.6), cam: D.fixed(whp(1.2, 1.5, -4.8), near(A.cedricWh, 0, 1.6, 0), { push: 0.2, fov: 40 }) },                      // Cedric Cold-Eye
    { t: L(28, -0.2), cam: D.orbit(() => wp(A.arthasWh).lerp(wp(A.luWh), 0.5), { r: 3.4, h: 1.5, a0: 1.6, w: 0.1, t0: L(28), lookH: 1.4, fov: 52 }) },  // gone from the doorstep
    { t: L(29, 0.2), cam: D.fixed(whp(4.5, 3.2, 12), whp(0, 1.2, 2), { push: 0.2, fov: 60 }) },                                    // "tangled inside"
    { t: L(30, -0.2), cam: D.orbit(A.silasWh, { r: 2.6, h: 1.2, a0: -2.4, w: 0.12, t0: L(30), lookH: 0.9, fov: 50 }) },               // "Silas began to unravel"
    { t: L(31, -0.1), cam: D.fixed(whp(-0.4, 1.0, 5.6), whp(1.6, 1.0, 9.4), { push: 0.3, fov: 48 }) },                               // "fur breaking skin, eyes gone wild"
    { t: L(32, -0.2), cam: D.fixed(whp(1.8, 1.4, 10.5), whp(-3.6, 0.9, 15.4), { fov: 56 }) },                                       // "he tore through a man in the shadows"
    { t: L(33, -0.2), cam: D.orbit(whp(-3.4, 0, 15.0), { r: 3.0, h: 3.0, a0: 0.8, w: 0.08, t0: L(33), lookH: 0.4, fov: 56 }) },        // "the warehouse ran red"
    { t: L(34, -0.3), cam: D.orbit(A.vials, { r: 1.4, h: 0.3, a0: 1.2, w: 0.15, t0: L(34), lookH: 0, fov: 46 }) },                     // seven doses
    { t: L(35, -0.2), cam: D.fixed(whp(-0.9, 1.65, 4.6), near(A.luWh, 0, 1.55, 0), { push: 0.15, fov: 42 }) },                        // "what comes after that"
    { t: L(36, -0.4), cam: D.fixed(whp(0.4, 1.6, 9.5), whp(0, 1.4, -4), { fov: 62 }) },                                              // "the armed merchants stormed through the doorway"
    { t: L(37, -0.2), cam: D.orbit(whp(0, 0, 4.6), { r: 4.8, h: 2.2, a0: 1.4, w: 0.1, t0: L(37), lookH: 1.2, fov: 58 }) },
    { t: L(38, -0.4), cam: D.fixed(whp(-3.0, 1.5, 8.6), whp(-1.5, 1.3, 3.0), { fov: 50 }) },                                         // "I froze one dead with an ice-shard whisper"
    { t: L(39, -0.3), cam: D.fixed(whp(2.6, 1.0, 2.2), whp(0.4, 1.2, 4.4), { fov: 52 }) },                                           // "Arthas broke one with a single blow"
    { t: L(40, -0.2), cam: D.fixed(whp(0, 1.6, 7.5), whp(0, 1.4, -10), { push: 0.2, fov: 56 }) },                                    // "the survivors fled into darkness"
    { t: L(41, -0.2), cam: D.dolly(whp(0, 1.8, 1.5), whp(0, 2.4, -4.5), whp(0, 1.2, -30), { fov: 66 }) },                             // "now the hunters may hunt us"
    // chorus 2: with the brothers
    { t: 187.1, cam: D.dolly(P(X.sec.chorus2.d0 + 10, 0, 7), P(X.sec.chorus2.d0 + 18, 0, 3.5), () => wp(A.lu_chorus2).add(V3(0, 1.2, 0)), { fov: 64 }) },
    { t: L(43, -0.3), cam: D.fixed(near(A.lu_chorus2, -1.8, 2.0, 0), near(A.sev_chorus2, 0, 1.4, 0), { push: 0.35, fov: 32 }) },
    { t: L(44, -0.3), cam: D.track(A.lu_chorus2, { offset: [0, 1.7, 4.2], lookOffset: [0, 1.3, 0], fov: 62 }) },
    { t: L(45, -0.3), smooth: 2, cam: D.track(A.arthas_c2, { offset: [-0.4, 1.0, 2.6], lookOffset: [0, 1.7, 0], fov: 50 }) },
    { t: L(46, -0.2), cam: D.orbit(A.lu_chorus2, { r: 5, r1: 12, h: 1.4, h1: 9, a0: 0, w: 0.2, t0: L(46), lookH: 1.2, fov: 60 }) },
    { t: 205.5, cam: D.rail({ h: 2.4, ahead: 20, lookH: 1.4, fov: 68 }) },
    // the square
    { t: 211.6, blend: 1.0, cam: D.orbit(A.crowd, { r: 12, r1: 8, h: 6, h1: 2.6, a0: 2.4, w: 0.06, t0: 211.6, lookH: 1.4, fov: 58 }) },
    { t: L(47, -0.2), cam: D.fixed(near(A.crowd, 0, 1.7, 0), near(A.luSquare, 0, 1.6, 0), { push: 0.2, fov: 40 }) },                 // "church business"
    { t: L(48, -0.2), cam: D.fixed(P(X.sec.bridge.d0 + 9, 0.6, 1.7), near(A.luSquare, 0, 1.55, 0), { push: 0.25, fov: 40 }) },               // "lied through my teeth"
    { t: L(49, -0.2), smooth: 1.6, cam: D.track(A.arthasSquare, { offset: [0.6, 1.6, 2.6], lookOffset: [0, 1.6, 0], fov: 46 }) },        // "Arthas won't look me in the eye"
    { t: L(50, -0.2), cam: D.fixed(near(A.arthasSquare, 0.8, 1.6, 0.4), near(A.luSquare, 0, 1.55, 0), { push: 0.25, fov: 36 }) },     // another debt
    { t: L(51, -0.2), cam: D.orbit(A.silasBound, { r: 2.4, h: 1.4, a0: 2.0, w: 0.12, t0: L(51), lookH: 1.0, fov: 50 }) },              // "we bound Silas"
    { t: L(52, -0.2), cam: D.fixed(P(X.sec.bridge.d0 + 21.4, -5.4, 1.5), near(A.silasBound, 0, 1.2, 0), { push: 0.4, fov: 36 }) },       // into the dark of his mind
    // Severin
    { t: L(53, -0.3), cam: D.dolly(P(dGate - 13, -1.4, 1.9), P(dGate - 6.5, -0.4, 1.6), near(A.severin, 0, 1.55, 0), { fov: 44 }) },
    { t: L(54, -0.2), cam: D.dolly(P(dGate - 7, 1.6, 0.6), P(dGate - 8.5, -1.2, 0.9), near(A.severin, 0, 1.7, 0), { fov: 54 }) },                  // past the gates
    { t: 243.4, smooth: 2, cam: D.rail({ h: 1.7, ahead: 12, lookH: 1.5, fov: 58 }) },                                                  // "I don't know what"
    { t: 251.2, cam: D.dolly(P(dGate - 9, 0.5, 2.0), P(dGate - 4, 0, 1.8), () => P(dGate + 4, 0, 1.6), { fov: 58 }) },
    // the fire
    { t: L(57, -0.4), blend: 1.0, cam: D.orbit(A.fire, { r: 6.5, h: 2.4, a0: 2.6, w: 0.05, t0: L(57), lookH: 1.0, fov: 58 }) },   // "out there still in the black of the pines"
    { t: L(58, -0.2), cam: D.orbit(A.fire, { r: 5, h: 2.2, a0: 0.6, w: 0.08, t0: L(58), lookH: 0.8, fov: 54 }) },
    { t: L(59, -0.2), cam: D.fixed(campCam(A.arthasCamp, -0.5, 1.3, -0.75), near(A.arthasCamp, 0, 0.9, 0), { push: 0.2, fov: 44 }) },               // "my brothers won't speak"
    { t: L(60, -0.2), cam: D.fixed(campCam(A.luCamp, 0.5, 1.2), near(A.luCamp, 0, 1.0, 0), { push: 0.2, fov: 40 }) },                // "I don't know what she wants"
    { t: L(61, -0.2), cam: D.orbit(A.fire, { r: 5, r1: 20, h: 2.5, h1: 14, a0: 2.2, w: 0.05, t0: L(61), lookH: 0.5, fov: 56 }) }        // "or what she seeks"
  ];
}

C.levels[ID] = {
  session: 'Level 1 · Session recap · the first session',
  blurb: 'Lucien plays the Blackbird for fewer coins every night, the trade guild wants its money, and Silas has his drugs. At the harbour warehouse he finds his half-brothers Arthas and Cedric, Silas turns into a beast, and merchant blood is spilled. And a name waits in the pines: Severin.',
  length: '5 min', audio: 'levels/01-' + ID + '.mp3',
  packs: ['nature', 'village', 'beasts'],
  doorAt: 50.4,
  titles: TITLES,
  cues: CUES, keys: KEYS, duration: DURATION, silenceT: 285.5, lineTimes: LINE_TIMES, beats: BEATS,
  clearings, shots,
  build(X) { return SCENES.map((f) => f(X)).filter(Boolean); }
};
})(typeof window !== 'undefined' ? window : globalThis);
