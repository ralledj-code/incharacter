/* Level 6: Slaying the Pig (06/07/2026). Lucien sings.
   The Pig's compound is under the ground: a massive built complex of halls. The fight is in the great hall, round its pool of blood: they drive him back, Lucien's fire,
   the burned room (the prisoners), the Pig drags Arthas under the blood and nearly drowns him, they haul him out, the Pig falls.
   Then the ash next door, the black water from the rock into a corrupted well (a wolf rises out of it), the draining hall where the people
   of Stagford were bled, up the tunnel into Stagford itself (sacked and empty on the surface), the last prisoner turns out to be Severin (Baphomet in a vision, the elixir), Lucien pours it out alone,
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
C.defineMood('deadcity', 0x2a2624, 0.02, 0x14141c, 0x6a4a3a, 0xb0a090, 0x2a2420, 0.95, 0xffc0a0, 0.6, 0xffa060, 1.8, 0x2a2420, 0.2, 0, 0);   // Stagford: sacked, smoke over a grey dusk
C.defineMood('church', 0x1a1610, 0.018, 0x0a0806, 0x2a2016, 0xffe0b0, 0x2a2016, 1.0, 0xffe0c0, 0.5, 0xffd090, 1.6, 0x2a2218, 0, 0, 0);
const KEYS = [
  { t: -1e6, m: 'bar', b: 0 }, { t: 9.5, m: 'pigfight', b: 1.5 }, { t: 25.9, m: 'flash', b: 0.1 }, { t: 26.3, m: 'pigfight', b: 1.2 },
  { t: 44.5, m: 'wellRed', b: 2 }, { t: 58, m: 'pigfight', b: 3 }, { t: 75, m: 'crater', b: 3 }, { t: 84, m: 'blackwater', b: 4 },
  { t: 102, m: 'blackwater', b: 4 }, { t: 138.0, m: 'deadcity', b: 0.2 }, { t: 142.0, m: 'blackwater', b: 0.2 }, { t: 147.5, m: 'deadcity', b: 3 }, { t: 172, m: 'wellRed', b: 1.5 }, { t: 181, m: 'deadcity', b: 3 }, { t: 193.2, m: 'crater', b: 0.8 }, { t: 197.4, m: 'deadcity', b: 2 },
  { t: 263.5, m: 'church', b: 4 }, { t: 286.6, m: 'gaol', b: 3 }, { t: 303.6, m: 'blackwater', b: 5 }, { t: 324, m: 'black', b: 8 }
];
const TITLES = [
  { t: 138.3, name: 'Stagford', sub: 'sacked by the Pig, its people taken below' },
  { t: 269.5, name: 'High Inquisitor Valerys', sub: 'the church · Arthas and Cedric’s father' }
];

/* places along the rail (metres) */
const DP = 36;       // the blood pool in the Pig's compound
const DCH = 238;     // the church

/* ---- helpers ---- */
const darkTint = (g, hex) => {
  const one = (x) => { const y = x.clone(); if (y.color) y.color.setHex(hex); return y; };
  if (g) g.traverse((m) => { if (m.isMesh) m.material = Array.isArray(m.material) ? m.material.map(one) : one(m.material); });
  return g;
};

const SCENES = [
  /* ---- the Pig's compound under the ground: a massive built complex of halls.
     The great hall (the blood pool, the burned room above its back wall), the hall behind it (the ash, the black water and the well),
     the draining hall (where the people of Stagford were bled), the tunnel up, and Stagford itself on the surface: sacked and empty.
     Everything here is in the compound's own frame F: -z is deeper in, +x to the right. ---- */
  function compound(X) {
    const ch = chars(X), kit = C.kit(X), g = new THREE.Group(), Lk = X.line;
    g.add(C.lib.cave(X, 4, DP - 14, { w: 4, h: 5 }));   // the passage down from the cave to the compound's door
    const F = new THREE.Group(); F.position.copy(X.at(DP, 0, 0)); F.rotation.y = X.yawAt(DP); g.add(F); F.updateMatrixWorld(true);
    const P = (x, z, y) => V3(x, y || 0, z);
    // ---- the halls ----
    const stone = new THREE.MeshLambertMaterial({ color: 0x7a6e64, map: C.tex('castle_brick_07_diff', 5, 3) || null });
    const floorM = new THREE.MeshLambertMaterial({ color: 0x5a524a, map: C.tex('cobblestone_floor_04_diff', 6, 6) || null });
    const B = (w, h, d, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || stone); o.position.set(x, y, z); F.add(o); return o; };
    const endWall = (z, W, H, dw, dh) => { B(W - dw / 2, H, 0.6, -(W + dw / 2) / 2, H / 2, z); B(W - dw / 2, H, 0.6, (W + dw / 2) / 2, H / 2, z); B(dw, H - dh, 0.6, 0, dh + (H - dh) / 2, z); };
    const hall = (z0, z1, W, H) => {
      const L = z0 - z1, zc = (z0 + z1) / 2;
      B(0.6, H, L, -W, H / 2, zc); B(0.6, H, L, W, H / 2, zc); B(W * 2 + 0.6, 0.6, L, 0, H + 0.3, zc, new THREE.MeshLambertMaterial({ color: 0x1a1612 }));
      const f = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, L), floorM); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.02, zc); F.add(f);
    };
    hall(16, -16, 13, 11);  hall(-16, -44, 10, 8);  hall(-44, -80, 12, 10);  hall(-80, -96, 2.6, 4.2);
    endWall(16, 13, 11, 4.4, 5);
    // the great hall's back wall: a door below, the burned room's window above it
    B(11.4, 11, 0.6, -7.3, 5.5, -16); B(11.4, 11, 0.6, 7.3, 5.5, -16); B(3.2, 1.0, 0.6, 0, 3.9, -16); B(3.2, 4.4, 0.6, 0, 8.8, -16);
    // the burned room above the door (its floor is the second hall's low ceiling there)
    B(12, 0.4, 7, 0, 4.4, -19.5); B(0.4, 3.6, 7, -6, 6.2, -19.5); B(0.4, 3.6, 7, 6, 6.2, -19.5); B(12, 3.6, 0.4, 0, 6.2, -23);
    endWall(-44, 12, 10, 4.4, 5); endWall(-80, 12, 10, 5.2, 4.2);
    const cols = []; for (let z = 12; z > -14; z -= 6) [-1, 1].forEach((s) => cols.push(cy(0.6, 0.7, 11, 10, 0x8a7e70, [s * 9, 5.5, z])));
    for (let z = -48; z > -78; z -= 7) [-1, 1].forEach((s) => cols.push(cy(0.5, 0.6, 10, 10, 0x8a7e70, [s * 8.6, 5, z])));
    F.add(solid(cols));
    // braziers in the great hall, torches on the walls further in
    const fires = [[-9.5, 10], [9.5, 10], [-9.5, -11], [9.5, -11]].map(([x, z]) => { F.add(solid([cy(0.5, 0.35, 1.0, 8, 0x3a3634, [x, 0.5, z])])); const fr = kit.fire({ scale: 0.8, size: 4 }); fr.group.position.set(x, 1.0, z); F.add(fr.group); return fr; });
    const wallT = []; [[-9.6, -24], [9.6, -38], [-11.6, -52], [11.6, -60], [-11.6, -70], [11.6, -76]].forEach(([x, z]) => { const l = X.glow(0xffa050, 2.6, 0.9); l.position.set(x * 0.98, 3, z); F.add(l); wallT.push(l); });
    // hooks and chains in the great hall
    const hk = []; for (let i = 0; i < 8; i++) { const x = -11 + i * 3.1, z = 13; hk.push(cy(0.02, 0.02, 4, 4, 0x3a3a40, [x, 9, z]), cy(0.3, 0.22, 1.4, 6, 0x5a1414, [x, 6.3, z]), cy(0.12, 0.12, 0.3, 5, 0xd8ccb0, [x, 5.5, z])); }
    F.add(solid(hk));
    // ---- the blood pool, in the middle of the great hall, and the channels that feed it from the draining hall ----
    const pool = new THREE.Mesh(new THREE.CircleGeometry(5.6, 32), new THREE.MeshLambertMaterial({ color: 0x220303, emissive: 0x0c0101 })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.04; F.add(pool);
    const rim = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; rim.push(bx(1.3, 0.3, 0.6, 0x5a4e46, [Math.cos(a) * 5.9, 0.15, Math.sin(a) * 5.9], [0, -a, 0])); }
    F.add(solid(rim));
    const chanM = new THREE.MeshLambertMaterial({ color: 0x2a0404, emissive: 0x0a0000 });
    const chan = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 72), chanM); chan.rotation.x = -Math.PI / 2; chan.position.set(1.2, 0.035, -42); F.add(chan);
    const sheen = []; for (let i = 0; i < 6; i++) { const s = X.glow(0xff3020, R(1.5, 3), 0.08); s.position.set(R(-3, 3), 0.1, R(-3, 3)); F.add(s); sheen.push(s); }
    // ---- the burned room: fire still in the window, smoke, the prisoners ----
    const kz = -16;
    const winFire = []; for (let i = 0; i < 5; i++) { const f = X.glow(0xff6a20, R(1.5, 2.6), 0); f.position.set(R(-1.4, 1.4), 5.4 + R(-0.2, 0.8), -18.5); F.add(f); winFire.push(f); }
    const smoke = []; for (let i = 0; i < 12; i++) { const s = C.lib.smoke(X, 0x141010, R(2, 3.5), 0); F.add(s); smoke.push({ s, ph: R(0, 1), x: R(-1.2, 1.2) }); }
    for (let k = 0; k < 3; k++) { const p = ch.person({ seed: 6100 + k * 9, outfit: 'peasant', pose: 'Fixing_Kneeling' }); darkTint(p, 0x2a1a14); p.position.set(-2.2 + k * 2.2, 4.6, -20.5 - (k % 2)); p.rotation.y = R(-0.4, 0.4); F.add(p); }
    // ---- the second hall: next door lies ash (two bodies), the black water out of the rock into the well ----
    const hx = 7.2, hz = -27;
    F.add(solid([bx(4.4, 0.04, 6, 0x141210, [hx, 0.03, hz]), bx(0.25, 0.25, 4, 0x0e0a08, [hx - 1, 0.3, hz + 1], [0.2, 0.6, 0.3]), bx(1.6, 0.6, 0.3, 0x1c1614, [hx + 1, 0.3, hz - 2]), ic(0.5, 0, 0x1a1412, [hx - 1.4, 0.2, hz - 1.8])]));
    [0, 1].forEach((k) => { const b = lay(ch.person && ch.person({ bake: true, seed: 6200 + k * 5, outfit: 'peasant' })); if (b) { darkTint(b, 0x141010); b.position.set(hx - 0.9 + k * 1.8, 0.03, hz + (k ? 1.2 : -0.6)); b.rotation.y = k ? 2.6 : 0.4; F.add(b); } });
    const embers = []; for (let i = 0; i < 8; i++) { const e = X.glow(0xff5a20, R(0.3, 0.7), 0.6); e.position.set(hx + R(-2, 2), 0.1, hz + R(-2.5, 2.5)); F.add(e); embers.push(e); }
    const wellP = V3(-5.6, 0, -35), rock = V3(-9.2, 0, -39.5);
    F.add(solid([ic(2.0, 0, 0x3a3634, [rock.x, 1.6, rock.z], [1, 1.6, 1]), cy(1.25, 1.35, 0.8, 14, 0x3a3632, [wellP.x, 0.4, wellP.z])]));
    const blk = new THREE.MeshLambertMaterial({ color: 0x050608, emissive: 0x010204 });
    const wd = new THREE.Mesh(new THREE.CircleGeometry(1.05, 20), blk); wd.rotation.x = -Math.PI / 2; wd.position.set(wellP.x, 0.82, wellP.z); F.add(wd);
    const wch = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1), blk); const cv = rock.clone().sub(wellP); wch.scale.y = cv.length() - 2.2; wch.rotation.set(-Math.PI / 2, 0, Math.atan2(cv.x, cv.z)); wch.position.copy(wellP.clone().add(rock).multiplyScalar(0.5)).setY(0.05); F.add(wch);
    const glints = []; for (let i = 0; i < 8; i++) { const s = X.glow(0x8aa0c0, 0.25, 0.4); F.add(s); glints.push({ s, ph: i / 8 }); }
    const wolf = C.creature('wolf', { h: 1.5, tint: 0x0c0c10, eyes: 0xff2a10 }); if (wolf) { wolf.userData.label = 'water-wolf'; X.anims.push(wolf); wolf.position.set(wellP.x + 1.8, 0, wellP.z + 1.4); F.add(wolf); }
    const mist = C.lib.smoke(X, 0x0a0a0e, 4, 0); mist.position.set(wellP.x + 1.4, 1.2, wellP.z + 1.2); F.add(mist);
    // ---- the draining hall: stone slabs, the people of Stagford on them, cages from the ceiling ----
    const slabs = [];
    for (let z = -49; z > -77; z -= 4) [-1, 1].forEach((s) => slabs.push(bx(1.1, 0.9, 2.3, 0x6a625a, [s * 5, 0.45, z]), bx(0.2, 0.06, 2.3, 0x4a0606, [s * 5 - s * 0.6, 0.92, z])));
    F.add(solid(slabs));
    let bi = 0;
    for (let z = -49; z > -77; z -= 4) [-1, 1].forEach((s) => { if ((bi++ % 3) === 2) return; const b = lay(ch.person && ch.person({ bake: true, seed: 7000 + bi * 11 })); if (!b) return; darkTint(b, 0x9aa0a8); b.position.set(s * 5, 0.92, z + 0.9); F.add(b); });
    const cages = []; [[-3, -54], [3.2, -62], [-2.6, -70]].forEach(([x, z]) => { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; cages.push(cy(0.03, 0.03, 2.2, 4, 0x3a3a40, [x + Math.cos(a) * 0.8, 5.4, z + Math.sin(a) * 0.8])); } cages.push(cy(0.85, 0.85, 0.1, 10, 0x3a3a40, [x, 4.3, z]), cy(0.03, 0.03, 3.6, 4, 0x3a3a40, [x, 8.3, z])); });
    F.add(solid(cages));
    // ---- the tunnel up, and Stagford on the surface: sacked, burned, empty ----
    const QZ = -128;
    F.add(solid([ic(5, 0, 0x4a4644, [-7.6, 3, -96], [1, 1, 1.2]), ic(5, 0, 0x4a4644, [7.6, 3, -96], [1, 1, 1.2]), bx(10, 4, 3, 0x3a3634, [0, 6.2, -96])]));
    const cobble = new THREE.Mesh(new THREE.PlaneGeometry(40, 110), new THREE.MeshLambertMaterial({ color: 0x5a5650, map: C.tex('cobblestone_floor_04_diff', 10, 26) || null })); cobble.rotation.x = -Math.PI / 2; cobble.position.set(0, 0.025, -152); F.add(cobble);
    const hs = []; const yawF = F.rotation.y;
    for (let z = -106; z > -200; z -= 9) [-1, 1].forEach((s) => { if (Math.abs(z - QZ) < 7) return; const p = F.localToWorld(V3(s * R(9.5, 11), 0, z + R(-1, 1))); hs.push({ x: p.x, z: p.z, yaw: yawF + (s < 0 ? Math.PI / 2 : -Math.PI / 2), w: pick([4, 6]), d: 6, st: R(0, 1) < 0.5 ? 2 : 1, brick: R(0, 1) < 0.4 }); });
    const vil = kit.village(hs, { tint: 0x4a4440, glass: 0x060606 }); if (vil) g.add(vil);
    const debris = []; for (let i = 0; i < 26; i++) { const z = R(-104, -196), x = R(-7, 7); if (Math.abs(x) < 1.6) continue; debris.push(bx(R(0.4, 1.4), R(0.1, 0.4), R(0.2, 1.2), pick([0x2a2420, 0x1c1814, 0x3a3028]), [x, 0.1, z], [0, R(0, TAU), R(-0.3, 0.3)])); }
    debris.push(cy(2.2, 2.4, 0.8, 16, 0x5a5650, [-6.2, 0.4, QZ - 5]), cy(1.9, 1.9, 0.05, 16, 0x1a1816, [-6.2, 0.82, QZ - 5]));
    F.add(solid(debris));
    put(F, 'Prop_Wagon', V3(-4.6, 0, -114), 0.5, 2.0); put(F, 'Barrel', V3(4.8, 0, -150), 0, 1.0); put(F, 'Prop_Wagon', V3(4.4, 0, -168), 2.4, 2.0);
    const citySmoke = []; [[-11, -112], [10, -134], [-10, -150], [11, -170], [-11, -186]].forEach(([x, z]) => { for (let i = 0; i < 5; i++) { const s = C.lib.smoke(X, 0x1a1816, R(4, 7), 0); F.add(s); citySmoke.push({ s, x, z, ph: R(0, 1) }); } });
    const cityEmbers = []; for (let i = 0; i < 20; i++) { const e = X.glow(0xff6a20, R(0.3, 0.8), 0.6); e.position.set(R(-12, 12), R(0.2, 4), R(-106, -190)); F.add(e); cityEmbers.push(e); }

    // ---- the fight ----
    const pig = C.lib.pig(X, { pose: 'Idle_Loop' });
    const lu = ch.lucien({ pose: 'Idle_Loop' }), art = ch.arthas({ pose: 'Sword_Idle' }), ced = ch.cedric({ pose: 'Idle_Loop' });
    lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
    const torchG = X.glow(0xffa040, 1.1, 0); C.attach(lu, 'hand_r', torchG, [0, 0.12, 0.05]);
    const vial = X.glow(0x60ff90, 0.45, 0); C.attach(lu, 'hand_l', vial, [0, 0.08, 0.04]);
    const pri = ch.person({ seed: 6107, female: false, outfit: 'peasant', tint: 0x5a4a3a, pose: 'Idle_Loop' }); pri.userData.label = 'prisoner';
    const sev = severin(X, ch, { crown: true });
    [pig, lu, art, ced, pri, sev].forEach((o) => o && F.add(o));
    if (pig) pig.position.set(-0.5, 0, -9.5);
    lu.position.set(0.8, 0, 15.5); art.position.set(-1.2, 0, 15); ced.position.set(2.2, 0, 15.2);
    pri.position.set(-3, 0, -66); sev.position.set(-0.4, 0, QZ - 2.2);
    const fireT = Lk(1), grabT = 43.6, underT = 45.8, pullT = 57.0, outT = 61.0, killT = 64.6;
    const turnT = Lk(26), sevGo = Lk(34, -0.6), shakeT = Lk(35), hideT = Lk(38), pourT = Lk(40), aloneT = Lk(42, -1.2);
    const q = (x, dz) => P(x, QZ + dz);
    const acts = [
      pig && C.act(pig, [{ t: 0, pose: 'Idle_Loop', face: P(0, 10) },
        { t: 12.5, to: [P(-3.4, -6), P(-7.0, -1.0), P(-3.6, 4.2)], by: 17.5 }, { t: 17.5, pose: 'Sword_Idle', face: P(-1.2, 7) },        // round the pool at them
        { t: Lk(0), to: P(-4.8, 1.4), move: 1.5, back: true }, { t: Lk(0, 1.6), pose: 'Idle_Loop', face: P(-1, 6) },                 // "we drove it back"
        { t: Lk(4, -1.6), to: P(-2.6, 3.6), move: 1.4 }, { t: grabT, to: P(-1.6, 1.4, -0.45), move: 2.0, air: true },                     // he takes Arthas into the blood
        { t: underT, pose: 'Sword_Idle', face: P(-0.8, 0.6) },
        { t: Lk(7, 0.4), to: P(-3.4, -1.2, -0.3), move: 1.6, air: true, back: true },                                                       // Cedric drives him off
        { t: outT, to: P(-4.0, 1.8), move: 1.4, air: true }, { t: outT + 1.4, pose: 'Idle_Loop', face: P(0, 3) }], { ignoreGround: true }),
      C.act(art, [{ t: 0, face: P(0, 0) }, { t: 10.6, to: [P(-1.2, 10), P(-1.6, 6.8)], by: 15.5 }, { t: 15.5, pose: 'Sword_Idle', face: P(-3.6, 4.2) },
        { t: Lk(0, 0.2), to: P(-3.0, 4.4), move: 1.4 }, { t: Lk(0, 1.6), pose: 'Sword_Idle', face: P(-4.8, 1.4) },
        { t: grabT, to: P(-0.9, 1.0, -1.1), move: 2.0, air: true },
        { t: underT, to: P(-0.8, 0.6, -1.5), move: 6, air: true },
        { t: pullT, to: P(1.4, 4.6), move: 2.4, air: true }, { t: pullT + 2.4, pose: 'Fixing_Kneeling', face: P(-1, 0) },
        { t: outT + 0.8, pose: 'Sword_Idle', face: P(-4.0, 1.8) }, { t: killT - 1.6, to: P(-2.6, 2.8), move: 1.6 }, { t: killT, pose: 'Sword_Idle', face: P(-4.0, 1.8) },
        { t: Lk(9, 0.2), pose: 'Fixing_Kneeling', face: P(-4.0, 1.8) },
        { t: 100.5, to: [P(-1.4, -6), P(-0.6, -18), P(-2.4, -40), P(-2.0, -76), P(-1.2, -96), P(-1.2, q(0, 5).z)], by: 161.5 }, { t: 161.5, pose: 'Idle_Loop', face: q(0, -3) },
        { t: shakeT, pose: 'Idle_Loop', face: q(-8, 8) },                                                                            // "Arthas doubted, shook his head"
        { t: aloneT, to: [q(-1.2, 12), P(-1.2, -100)], speed: 1.3 }, { t: aloneT + 22, show: false }], { ignoreGround: true }),
      C.act(ced, [{ t: 0, face: P(0, 0) }, { t: 11.0, to: [P(2.2, 10), P(0.8, 7.0)], by: 15.8 }, { t: 15.8, pose: 'Idle_Loop', face: P(-3.6, 4.2) },
        { t: Lk(0, 0.4), to: P(-2.0, 3.0), move: 1.2 }, { t: Lk(0, 1.6), pose: 'Sword_Idle', face: P(-4.8, 1.4) },
        { t: Lk(4, -1.0), to: P(-0.2, 5.6), move: 0.6, back: true }, { t: Lk(4, -0.4), pose: 'Idle_Loop', face: P(-2.6, 3.6) },
        { t: Lk(7, -0.6), to: P(-2.2, 1.6), move: 1.0 }, { t: Lk(7, 0.4), pose: 'Sword_Idle', face: P(-3.4, -1.2) },
        { t: pullT, to: P(0.4, 2.6), move: 0.8 }, { t: pullT + 0.8, pose: 'Idle_Loop', face: P(-0.8, 0.6) },
        { t: Lk(9), pose: 'Sword_Idle', face: P(-6, 6) },
        { t: 101, to: [P(1.6, -6), P(0.6, -18), P(2.4, -40), P(2.2, -76), P(1.4, -96), P(1.4, q(0, 5.4).z)], by: 162 }, { t: 162, pose: 'Idle_Loop', face: q(0, -3) },
        { t: Lk(36, -0.4), pose: 'Idle_Loop', face: lu },                                                                            // "Cedric's eyes stayed sharp and still"
        { t: aloneT + 0.3, to: [q(1.4, 12), P(1.4, -100)], speed: 1.3 }, { t: aloneT + 22, show: false }]),
      C.act(lu, [{ t: 0, face: P(0, 0) }, { t: 10.4, to: [P(0.8, 12), P(1.6, 8.4)], by: 15.4 }, { t: 15.4, pose: 'Spell_Simple_Idle_Loop', face: P(-3.6, 4.2) },
        { t: fireT - 0.4, pose: 'Spell_Simple_Idle_Loop', face: P(-4.8, 1.4) },                                                           // "where my fire cracked"
        { t: Lk(2, -0.2), pose: 'Idle_Loop', face: P(0, kz) },                                                                           // he looks up at the window
        { t: Lk(7, 0.2), to: P(1.2, 3.4), move: 1.6 }, { t: Lk(7, 1.8), pose: 'Spell_Simple_Idle_Loop', face: P(-3.4, -1.2) },
        { t: pullT, to: P(0.6, 3.6), move: 0.6 }, { t: pullT + 0.6, pose: 'Crouch_Idle_Loop', face: P(-0.8, 0.6) },
        { t: outT, pose: 'Spell_Simple_Idle_Loop', face: P(-4.0, 1.8) },
        { t: Lk(9), pose: 'Spell_Simple_Idle_Loop', face: P(-6, 6) },                                                                       // "still we shout"
        { t: Lk(9, 0.6), to: [P(2.2, -6), P(0.8, -15), P(0.6, -19), P(hx - 2.6, hz + 2.4)], by: Lk(12, -0.5) }, { t: Lk(12, -0.5), pose: 'Idle_Loop', face: P(hx, hz) },   // next door
        { t: Lk(12, -0.2), to: [P(1.0, -30), P(wellP.x + 2.4, wellP.z + 1.0)], by: Lk(13, 0.2) }, { t: Lk(13, 0.2), pose: 'Idle_Loop', face: wellP },   // to the water
        { t: Lk(16, 0.4), to: [P(-0.6, -42), P(-0.4, -48)], speed: 1.2 }, { t: Lk(18), pose: 'Idle_Loop', face: P(-5, -52) },                // into the draining hall
        { t: 124.6, to: [P(0, -60), P(0, -76), P(0, -96)], by: 147.5 },                                                                      // "beneath the cave, below the ground"
        { t: 147.5, to: [P(0.2, -104), q(0.4, 1.4)], by: 161.5 }, { t: 161.5, pose: 'Idle_Loop', face: q(0, -3) },                            // up into Stagford
        { t: turnT + 0.6, pose: 'Idle_Loop', face: sev }, { t: Lk(34, -0.3), pose: 'Idle_Talking_Loop', face: q(0, 6) },                     // "I told my brothers"
        { t: hideT, pose: 'Idle_Loop', face: q(0, 6) },
        { t: pourT - 1.6, to: q(1.4, 0.4), move: 1.4 }, { t: pourT - 0.2, pose: 'Crouch_Idle_Loop', face: q(1.8, -0.6) },                   // "I poured it out upon the stone"
        { t: Lk(41), pose: 'Idle_Loop', face: q(0, -10) },
        { t: 236.4, to: [q(0.6, -6), q(0.3, -48)], by: 262.5 }]),
      C.act(pri, [{ t: 0, pose: 'Idle_Loop', face: P(0, -60) }, { t: 128.5, to: [P(-1.6, -76), P(-0.8, -96), P(-0.8, -104), q(-0.4, -2.2)], by: 161.2 }, { t: 161.2, pose: 'Idle_Loop', face: q(0, -10) },
        { t: turnT - 0.5, pose: 'Idle_Loop', face: lu }, { t: turnT + 0.5, show: false }]),                                                  // "her face was his, the prisoner turned"
      C.act(sev, [{ t: 0, show: false }, { t: turnT + 0.5, show: true, pose: 'Idle_Loop', face: lu }, { t: Lk(27), pose: 'Idle_Talking_Loop', face: lu },
        { t: Lk(28), pose: 'Spell_Simple_Idle_Loop', face: q(4, -16) }, { t: Lk(30), pose: 'Idle_Talking_Loop', face: lu },
        { t: Lk(31, -0.2), pose: 'Spell_Simple_Idle_Loop', face: lu }, { t: Lk(32), pose: 'Idle_Talking_Loop', face: lu }, { t: sevGo, show: false }]),
      wolf && C.act(wolf, [{ t: 0, show: false }, { t: Lk(14, -0.2), show: true, pose: 'Idle_2_HeadLow', face: P(wellP.x + 2.4, wellP.z + 1.0) }, { t: Lk(14, 1.4), pose: 'Idle', face: P(wellP.x + 2.4, wellP.z + 1.0) }, { t: Lk(15, 0.6), show: false }], { gait: [['Walk', 0.69], ['Gallop', 2.57]], idle: 'Idle' })
    ].filter(Boolean);
    // Baphomet in the vision, over the sacked roofs: then in chains, then in flames
    const baph = ch.baphomet ? ch.baphomet({ h: 13, pose: 'Idle_Loop' }) : null;
    const bp = q(4, -17);
    if (baph) { baph.position.copy(bp); baph.lookAt(F.localToWorld(q(0, 0))); baph.rotation.set(0, Math.atan2(-bp.x, 17), 0); F.add(baph); }
    const chains = []; for (let k = 0; k < 40; k++) { const a = k * 0.45; chains.push(M([bp.x + Math.cos(a) * 1.6, 2 + k * 0.16, bp.z + Math.sin(a) * 1.6], [Math.PI / 2, k % 2 ? Math.PI / 2 : 0, a], [3, 3, 3])); }
    const chainM = C.inst(kit.linkGeo, C.lamb({ color: 0xb8bcc8 }), chains); F.add(chainM);
    const flames = []; for (let k = 0; k < 10; k++) { const f = X.glow(0xff5a20, R(3, 6), 0); f.position.copy(bp).add(V3(R(-3, 3), R(0, 6), R(-3, 3))); F.add(f); flames.push(f); }
    const swirl = X.glow(0x70ffc8, 3, 0); swirl.position.copy(q(-0.4, -2.2)).setY(1.2); F.add(swirl);
    const splash = X.glow(0x60ff90, 2.4, 0); splash.position.copy(q(1.8, -0.6)).setY(0.1); F.add(splash);
    const bolts = [0, 1, 2].map(() => { const b = X.glow(0xff8a30, 1.0, 0); F.add(b); return b; });
    const splashB = X.glow(0xff2a10, 3.2, 0); splashB.position.set(-1, 0.4, 1); F.add(splashB);
    X.anchors.F = F; X.anchors.pool = new THREE.Object3D(); F.add(X.anchors.pool);
    X.anchors.pig = pig || F; X.anchors.luF = lu; X.anchors.arthasF = art; X.anchors.cedricF = ced; X.anchors.wolf = wolf || F;
    X.anchors.sev = sev; X.anchors.pri = pri; X.anchors.baph = baph || sev; X.anchors.splash = splash;
    X.cmp = { kz, hx, hz, wellP, rock, QZ };
    const visT = [Lk(28), Lk(30, 2)], chainT = [Lk(32), Lk(33)], vfT = [Lk(33), Lk(34, -0.4)];
    const Wp = (x, y, z) => F.localToWorld(V3(x, y, z));
    return {
      group: g, d0: 0, d1: 400, t0: 4, t1: 263.4,
      update(t, ctx) {
        acts.forEach((a) => a.update(t, ctx));
        C.lib.fallAt(pig, t, killT, 0.9, -1);                                                                                             // the Pig goes over backwards
        fires.forEach((f) => f.update(ctx.time));
        sheen.forEach((s, i) => { s.material.opacity = 0.1 + 0.08 * Math.sin(ctx.time * 0.7 + i); });
        winFire.forEach((f, i) => { f.material.opacity = (0.55 + 0.3 * Math.sin(ctx.time * 9 + i * 2)) * (t < 70 ? 1 : 0.4); });
        smoke.forEach((o) => { const u = (ctx.time * 0.12 + o.ph) % 1; o.s.position.set(o.x + u * 1.5, 6 + u * 4.5, -15.6 + u * 3); o.s.material.opacity = 0.45 * Math.sin(u * Math.PI); });
        embers.concat(cityEmbers).forEach((e, i) => { e.material.opacity = 0.4 + 0.3 * Math.sin(ctx.time * 3 + i); });
        citySmoke.forEach((o) => { const u = (ctx.time * 0.05 + o.ph) % 1; o.s.position.set(o.x + u * 3, 4 + u * 18, o.z); o.s.material.opacity = 0.5 * Math.sin(u * Math.PI); });
        const lp = lu.position.clone().add(V3(0, 1.4, 0)), pp = pig ? pig.position.clone().add(V3(0, 1.8, 0)) : V3(0, 0, 0);
        bolts.forEach((b, i) => { const u = (t - fireT - i * 0.45) / 0.5; b.material.opacity = u > 0 && u < 1 ? 1 : 0; if (u > 0 && u < 1) b.position.lerpVectors(lp, pp, u); });
        splashB.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - grabT - 1.6) / 0.8);
        glints.forEach((o) => { const u = (ctx.time * 0.15 + o.ph) % 1; o.s.position.lerpVectors(rock, wellP, u).setY(0.1); });
        mist.material.opacity = 0.5 * ss(Lk(14, -0.5), Lk(14, 0.5), t) * (1 - ss(Lk(15), Lk(15, 1), t));
        torchG.material.opacity = t > 102 ? 0.95 : 0;                                                                                     // "I carry fire"
        const vb = (t > visT[0] && t < visT[1]) || (t > chainT[0] && t < vfT[1]) || (t > Lk(39) && t < Lk(39, 2.5));
        if (baph) { baph.visible = vb; if (baph.userData.wings) baph.userData.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.4 + 0.3 * Math.sin(ctx.time * 2)); }); }
        chainM.visible = (t > chainT[0] && t < vfT[1]) || (t > Lk(39) && t < Lk(39, 2.5));
        flames.forEach((f, k) => { f.material.opacity = t > vfT[0] && t < vfT[1] ? 0.6 + 0.3 * Math.sin(ctx.time * 9 + k) : 0; });
        swirl.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - turnT - 0.5) / 0.6) + 0.7 * Math.max(0, 1 - Math.abs(t - sevGo) / 0.6);
        vial.material.opacity = t > Lk(31, 0.4) && t < hideT ? 0.9 : 0;
        splash.material.opacity = t > pourT && t < pourT + 4 ? 0.8 * (1 - (t - pourT) / 4) : 0;
        // light: wherever the story is
        const l0 = t < 72 ? Wp(0, 2, 0) : t < 84 ? Wp(hx, 3, hz) : t < 104 ? Wp(wellP.x, 3, wellP.z) : t < 148 ? Wp(0, 4, lu.position.z) : vb ? Wp(bp.x, 8, bp.z) : Wp(lu.position.x, 2.2, lu.position.z);
        ctx.light(0, l0.x, l0.y, l0.z, t < 72 ? 0xff3a20 : t < 84 ? 0xff7a30 : t < 104 ? 0x8aa0d0 : vb ? 0xff3010 : 0xffa040, vb ? 4 : 2.4, vb ? 40 : 26);
        const l1 = t < 84 ? Wp(0, 5.5, -18) : t > pourT && t < pourT + 4 ? Wp(splash.position.x, 1, splash.position.z) : Wp(0, 6, -60);
        ctx.light(1, l1.x, l1.y, l1.z, t > pourT && t < pourT + 4 ? 0x60ff90 : 0xff7a30, 2.4, 30);
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
  const K = X.cmp || { kz: -16, hx: 7.2, hz: -27, wellP: V3(-5.6, 0, -35), rock: V3(-9.2, 0, -39.5), QZ: -128 }, CHd = X.church || { L1: -32, gz: -21 };
  return [
    // the Blackbird, straight down into the cave
    { t: 0, cam: D.orbit(lu, { r: 3.2, h: 1.9, a0: 0.9, w: 0.08, t0: 0, lookH: 1.5, fov: 46 }) },
    { t: 5.0, cam: D.dolly(V3(0.6, 2.4, -6.6), V3(0, 2.0, -11.4), V3(0, 1.9, -16), { fov: 60, fov1: 72 }) },
    // the compound: the charge round the pool
    { t: 9.5, cam: D.dolly(f(0, 5.0, 11), f(3.6, 4.2, 8.5), f(0, 1, -4), { fov: 62 }) },
    { t: 13.6, cam: D.fixed(f(3.6, 1.0, 9.5), near(A.pig, 0, 2.2, 0), { push: 0.2, fov: 54 }) },
    { t: 16.9, cam: D.orbit(f(-2.4, 0, 5), { r: 5.5, h: 1.6, a0: 1.2, w: 0.2, t0: 16.9, lookH: 1.6, fov: 58 }) },
    { t: Lk(0, -0.2), cam: D.fixed(f(-0.6, 1.4, 9.0), near(A.pig, 0, 2.0, 0), { push: 0.3, fov: 50 }) },                      // "we drove it back"
    { t: Lk(1, -0.3), cam: D.fixed(f(3.4, 1.8, 10.4), near(A.pig, 0, 2.0, 0), { fov: 52 }) },                                // "where my fire cracked"
    { t: Lk(1, 2.2), cam: D.fixed(f(4, 3, 2), f(0, 6.5, K.kz), { push: 0.2, fov: 56 }) },                                    // smoke out of the burned room's window
    { t: Lk(2, -0.3), cam: D.fixed(f(1.2, 5.8, -12.5), f(0, 5.0, -19.5), { push: 0.4, fov: 50 }) },                          // "I sent the flame, I did not know"
    { t: Lk(3, -0.2), cam: D.fixed(f(-0.4, 5.6, -16.4), f(0, 4.8, -21), { push: 0.2, fov: 62 }) },                          // souls burning
    { t: Lk(4, -0.3), cam: D.fixed(f(1.9, 1.6, 6.6), near(A.luF, 0, 1.5, 0), { push: 0.25, fov: 40 }) },                     // "God forgive me"
    { t: Lk(4, 3.0), cam: D.fixed(f(4.5, 2.4, 6.5), f(-1.2, 0.4, 1.2), { push: 0.2, fov: 54 }) },                            // into the blood
    { t: Lk(5, 1.6), cam: D.fixed(f(1.6, 0.7, 3.4), near(A.arthasF, 0, 0.3, 0), { push: 0.2, fov: 46 }) },                   // under
    { t: Lk(6, -0.3), cam: D.fixed(f(1.9, 1.5, 7.0), near(A.luF, 0, 1.15, 0), { push: 0.3, fov: 38 }) },                     // "my hands still shake"
    { t: Lk(7, -0.2), cam: D.orbit(A.pool, { r: 7.5, h: 2.0, a0: 2.4, w: 0.15, t0: Lk(7), lookH: 1.0, fov: 58 }) },            // "what did I make?"
    { t: 56.8, cam: D.fixed(f(2.8, 1.0, 5.6), near(A.arthasF, 0, 0.6, 0), { push: 0.2, fov: 50 }) },                         // hauled out
    { t: 60.4, cam: D.orbit(near(A.pig, 0, 0, 0), { r: 6, h: 2.2, a0: 1.8, w: 0.12, t0: 60.4, lookH: 2.2, fov: 56 }) },
    { t: 63.9, cam: D.fixed(f(-0.6, 1.3, 7.4), f(-3.6, 1.2, 2.0), { fov: 56 }) },                                            // the blow, he goes over
    // the aftermath, deeper in
    { t: Lk(8, -0.2), cam: D.dolly(f(-1.6, 4.5, 6.4), f(-2.4, 2.4, 4.8), f(-4.6, 0.3, 0.8), { fov: 52 }) },                   // "the pig is dead"
    { t: Lk(9, -0.2), cam: D.orbit(f(0, 0, 3), { r: 5.5, h: 1.2, a0: 3.4, w: 0.1, t0: Lk(9), lookH: 1.4, fov: 56 }) },          // "still we shout"
    { t: Lk(10, -0.2), cam: D.fixed(f(K.hx - 4.4, 3.0, K.hz + 6), f(K.hx, 0.2, K.hz), { push: 0.25, fov: 52 }) },              // "next door lies ash"
    { t: Lk(11, -0.2), smooth: 2, cam: D.track(A.luF, { offset: [0.4, 1.6, 2.4], lookOffset: [0, 1.3, 0], fov: 42 }) },        // "my fireball, my hand"
    { t: Lk(12, -0.3), cam: D.dolly(f(K.wellP.x + 4.4, 1.6, K.wellP.z + 5), f(K.wellP.x + 3, 1.2, K.wellP.z + 3), f(K.rock.x, 1.5, K.rock.z), { fov: 56 }) },   // water from stone
    { t: Lk(13, -0.2), cam: D.fixed(f(K.wellP.x + 1.2, 2.6, K.wellP.z + 1.2), f(K.wellP.x, 0.7, K.wellP.z), { push: 0.3, fov: 50 }) },   // the corrupted well
    { t: Lk(14, -0.3), cam: D.fixed(f(K.wellP.x + 4.4, 1.0, K.wellP.z + 5.4), near(A.wolf, 0, 0.9, 0), { push: 0.25, fov: 44 }) },      // the black that turns a man to wolf
    { t: Lk(15, -0.2), cam: D.fixed(f(-1, 3.2, -30), f(K.hx, 0.4, K.hz), { push: 0.2, fov: 58 }) },                           // from the death I built myself
    { t: Lk(16, -0.2), cam: D.fixed(f(1.6, 0.6, -40), f(1.2, 0.05, -10), { push: 0.2, fov: 60 }) },                          // root to vein: the channel back to the pool
    { t: Lk(17, -0.2), smooth: 2, cam: D.track(A.luF, { offset: [0.8, 1.8, -3.0], lookOffset: [0, 0.6, 6], fov: 62 }) },      // the water carries all our pain
    { t: Lk(18, -0.3), cam: D.fixed(f(0, 3.6, -46), f(-5, 0.9, -58), { push: 0.25, fov: 58 }) },                             // the draining hall
    { t: Lk(19, -0.2), cam: D.fixed(near(A.luF, 0.8, 1.7, -1.6), near(A.luF, 0, 1.55, 0), { push: 0.15, fov: 42 }) },
    // chorus: beneath the cave, below the ground; and Stagford, up on the surface, empty
    { t: 124.4, cam: D.dolly(f(0, 8.5, -46), f(0, 6, -56), f(0, 0.5, -76), { fov: 64 }) },                                    // "what have we found"
    { t: Lk(21, -0.3), smooth: 2, cam: D.track(A.luF, { offset: [0.6, 1.8, 4.0], lookOffset: [0, 1.3, 0], fov: 56 }) },       // "beneath the cave"
    { t: Lk(22, -0.3), cam: D.dolly(f(-3, 1.4, -50), f(-3, 1.4, -66), f(-5, 0.9, -60), { fov: 52 }) },                        // the dead of Stagford
    { t: Lk(23, -0.3), cam: D.dolly(f(0, 22, -96), f(0, 18, -112), f(0, 0, -160), { fov: 64 }) },                            // a city empty, a city dead
    { t: Lk(24, -0.3), smooth: 2, cam: D.track(A.luF, { offset: [-0.5, 1.6, 2.2], lookOffset: [0, 1.5, 0], fov: 44 }) },      // I carry fire
    { t: Lk(25, -0.2), cam: D.fixed(f(3, 2.4, -100), near(A.luF, 0, 1.5, 0), { push: 0.2, fov: 56 }) },                       // out of the ground
    { t: 151.5, cam: D.fixed(f(-5, 9, -112), f(0, 1.5, K.QZ), { push: 0.15, fov: 60 }) },
    { t: 156.5, smooth: 2, cam: D.track(A.luF, { offset: [2.2, 2.3, 3.2], lookOffset: [0, 1.3, 0], fov: 54 }) },
    // Severin
    { t: Lk(26, -0.3), cam: D.fixed(f(1.8, 1.7, K.QZ + 3.6), near(A.pri, 0, 1.5, 0), { push: 0.3, fov: 40 }) },               // the prisoner turned
    { t: Lk(27, -0.2), cam: D.orbit(A.sev, { r: 2.8, h: 1.5, a0: 2.6, w: 0.08, t0: Lk(27), lookH: 1.5, fov: 44 }) },
    { t: Lk(28, -0.3), cam: D.fixed(f(-0.6, 1.4, K.QZ + 7), near(A.baph, 0, 8, 0), { push: 0.2, fov: 62 }) },                 // "Baphomet comes"
    { t: Lk(29, -0.2), cam: D.fixed(f(-1.8, 1.7, K.QZ - 6), near(A.sev, 0, 1.55, 0), { push: 0.2, fov: 40 }) },
    { t: Lk(30, -0.2), cam: D.orbit(f(0, 0, K.QZ), { r: 6, h: 2, a0: 0.4, w: 0.07, t0: Lk(30), lookH: 1.4, fov: 52 }) },
    { t: Lk(31, -0.3), cam: D.fixed(f(-1.6, 1.3, K.QZ - 0.4), () => wp(A.sev).lerp(wp(A.luF), 0.5).add(V3(0, 1.2, 0)), { push: 0.2, fov: 44 }) },   // the elixir
    { t: Lk(32, -0.3), cam: D.fixed(f(1.4, 2.0, K.QZ + 9), near(A.baph, 0, 7, 0), { push: 0.25, fov: 58 }) },                 // free from chains
    { t: Lk(33, -0.2), cam: D.fixed(f(-1.4, 1.2, K.QZ + 4), near(A.baph, 0, 6, 0), { push: 0.2, fov: 62 }) },                 // blood and flames
    { t: Lk(34, -0.2), cam: D.orbit(f(0, 0, K.QZ + 3), { r: 4.6, h: 1.6, a0: 2.4, w: 0.08, t0: Lk(34), lookH: 1.5, fov: 52 }) },   // "I told my brothers"
    { t: Lk(35, -0.2), cam: D.fixed(f(0.8, 1.7, K.QZ + 2.6), near(A.arthasF, 0, 1.6, 0), { push: 0.2, fov: 40 }) },           // Arthas doubted
    { t: Lk(36, -0.2), cam: D.fixed(f(-0.4, 1.7, K.QZ + 2.4), near(A.cedricF, 0, 1.6, 0), { push: 0.2, fov: 38 }) },          // Cedric's eyes
    { t: Lk(38, -0.2), cam: D.fixed(f(1.6, 1.3, K.QZ + 0.6), near(A.luF, 0, 1.0, 0), { push: 0.25, fov: 40 }) },             // the vial hid from sight
    { t: Lk(39, -0.2), cam: D.fixed(f(-2.4, 1.2, K.QZ + 5), near(A.baph, 0, 7, 0), { push: 0.3, fov: 56 }) },                 // that captive knight
    { t: Lk(40, -0.6), cam: D.fixed(near(A.splash, 1.6, 1.2, 1.6), near(A.splash, 0, 0.2, 0), { push: 0.2, fov: 46 }) },      // poured out upon the stone
    { t: Lk(41, -0.2), cam: D.fixed(f(0.8, 1.7, K.QZ - 1.4), near(A.luF, 0, 1.55, 0), { push: 0.2, fov: 42 }) },
    { t: Lk(42, -0.6), cam: D.orbit(A.luF, { r: 3, r1: 16, h: 2, h1: 14, a0: 0.4, w: 0.1, t0: Lk(42, -0.6), lookH: 1.2, fov: 56 }) },   // alone
    // chorus 2: alone through the sacked city
    { t: Lk(43, -0.3), smooth: 2, cam: D.track(A.luF, { offset: [0.6, 1.7, 3.6], lookOffset: [0, 1.3, 0], fov: 56 }) },
    { t: Lk(45, -0.3), cam: D.fixed(f(-5.5, 1.2, K.QZ - 22), near(A.luF, 0, 1.2, 0), { push: 0.15, fov: 56 }) },
    { t: Lk(46, -0.3), smooth: 2, cam: D.track(A.luF, { offset: [3, 5, -6], lookOffset: [0, 1, 6], fov: 60 }) },
    { t: Lk(47, -0.3), smooth: 2, cam: D.track(A.luF, { offset: [-0.5, 1.6, 2.2], lookOffset: [0, 1.5, 0], fov: 44 }) },
    { t: Lk(48, -0.2), smooth: 2, cam: D.track(A.luF, { offset: [0, 2.4, -5], lookOffset: [0, 1.6, 10], fov: 62 }) },
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
  blurb: 'In the blood pool of his own compound the Pig nearly drowns Arthas before they bring him down. Below the cave lie the halls where Stagford’s people were bled, and above, Stagford stands sacked and empty; the last prisoner wears Severin’s face, and Lucien pours her elixir out alone. Then the church, and their father, the High Inquisitor, who says nothing.',
  length: '6 min', audio: 'levels/06-' + ID + '.mp3',
  packs: ['nature', 'village', 'beasts'],
  doorAt: 5.0,
  titles: TITLES,
  cues: CUES, keys: KEYS, duration: DURATION, silenceT: 336, lineTimes: LINE_TIMES, beats: BEATS,
  clearings, shots,
  build(X) { return SCENES.map((f) => f(X)).filter(Boolean); }
};
})(typeof window !== 'undefined' ? window : globalThis);
