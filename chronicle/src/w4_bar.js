(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, sm, ss, M, bx, cy, cn, ic, tri, merge, part, solid, emis, lamb, R } = C;

/* Furniture and clutter from the CC0 props pack (only when it loaded). */
function dressBar(g, tables) {
  const put = (k, p, yaw, s) => { const m = C.place(k, p, yaw, s); if (m) g.add(m); return m; };
  // long tables with benches, mugs and candles
  tables.forEach((t, i) => {
    const tb = put('Table_Large', [t[0], 0, t[1]], Math.PI / 2); if (tb) tb.scale.set(0.75, 1, 0.8);
    [-0.75, 0.75].forEach((dx) => { const b = put('Bench', [t[0] + dx, 0, t[1]], Math.PI / 2); if (b) b.scale.set(0.72, 1, 1); });
    put('Mug', [t[0] + 0.15, 0.81, t[1] + 0.4], 0.4); put('Mug', [t[0] - 0.2, 0.81, t[1] - 0.5], 2.1);
    if (i !== 1) put('CandleStick_Triple', [t[0], 0.81, t[1] - 0.1], Math.PI / 2);
  });
  // bar stools (stretched a little: the counter is tall), one knocked over
  [-7.2, -5.9, -4.6, -2.0].forEach((z) => { const st = put('Stool', [2.7, 0, z], z); if (st) st.scale.set(1, 1.3, 1); });
  const st = put('Stool', [2.45, 0.24, -3.3], 0); if (st) st.rotation.z = Math.PI / 2;
  // behind and on the counter
  [-7.6, -6.2, -4.8, -3.4, -2.0].forEach((z, i) => put(i % 2 ? 'SmallBottles_1' : 'Bottle_1', [4.0, 1.17, z + 0.3], i));
  put('Barrel_Holder', [5.55, 1.2, -9.3], -Math.PI / 2);
  for (let i = 0; i < 7; i++) { put('Shelf_Small_Bottles', [5.62, 1.94, -7.6 + i * 1.0], -Math.PI / 2, 0.85); put(i % 2 ? 'SmallBottles_1' : 'Bottle_1', [5.6, 2.64, -7.4 + i * 1.0], -Math.PI / 2 + i, 1.1); }
  put('Barrel', [5.4, 0, -0.2], 0.3); put('Barrel', [5.45, 0, 0.6], 1.2); put('Crate_Wooden', [5.3, 0, 1.7], 0.2);
  // the back wall (behind the player at the start): bookcases, chest, banners, weapons
  put('Bookcase_2', [-3.6, 0, 5.25], Math.PI); put('Bookcase_2', [3.6, 0, 5.25], Math.PI);
  put('Chest_Wood', [-4.9, 0, 4.7], Math.PI / 2, 0.8);  // corner, clear of the player's start spot (z 4.4)
  put('Banner_1', [-5.95, 1.8, 1.4], Math.PI / 2, 0.8); put('Banner_2', [-5.95, 1.8, -6.6], Math.PI / 2, 0.8);
  put('WeaponStand', [-5.3, 0, 3.6], Math.PI / 2, 0.9); put('Shield_Wooden', [-5.95, 2.4, -2.5], Math.PI / 2, 0.9);
  put('Cauldron', [-4.7, 0, -4.7], 0.5, 0.7); put('Bucket_Wooden_1', [-4.6, 0, -0.3], 0);
  put('Book_Stack_1', [-2.95, 0.81, 2.0], 0.6);
}

/* Stage, band and crowd: the tavern is busy, Lucien plays the songs (all rigged CC0 models; skipped if not loaded).
   Returns { update(t, ctx) } to switch poses when a song starts. */
function stageAndCrowd(X, g, tables) {
  const ch = C.chars(X); if (!ch.person) return null;
  const SZ0 = -10.0, SZ1 = -7.9, SH = 0.45;
  // the stage: planks, a step, candles and banners either side of the door
  const pt = C.tex('wood_plank_wall_diff', 2.2, 0.4), stMat = new THREE.MeshLambertMaterial(pt ? { map: pt, color: 0x8a6a4a } : { color: 0x4a3222 });
  const plat = new THREE.Mesh(new THREE.BoxGeometry(5.8, SH, SZ1 - SZ0), stMat); plat.position.set(0, SH / 2, (SZ0 + SZ1) / 2); g.add(plat);
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, SH / 2, 0.4), stMat); step.position.set(0, SH / 4, SZ1 + 0.2); g.add(step);
  const put = (k, p, yaw, sc) => { const m = C.place(k, p, yaw, sc); if (m) g.add(m); return m; };
  put('CandleStick_Triple', [-2.6, SH, SZ1 - 0.25], 0, 1.4); put('CandleStick_Triple', [2.6, SH, SZ1 - 0.25], 0, 1.4);
  put('Banner_2', [-2.4, SH + 0.9, SZ0 - 0.05], 0, 0.9); put('Banner_1', [2.4, SH + 0.9, SZ0 - 0.05], 0, 0.9);
  const glows = [[-2.6, SH + 0.62, SZ1 - 0.25], [2.6, SH + 0.62, SZ1 - 0.25]].map((p) => { const s = X.glow(0xffb060, 1.6, 0.7); s.position.set(p[0], p[1], p[2]); g.add(s); return s; });
  // the band
  const add = (o, p, yaw) => { const c = o; c.position.set(p[0], p[1], p[2]); c.rotation.y = yaw || 0; g.add(c); return c; };
  const lucien = add(ch.lucien({ hub: true, pose: 'Idle_Talking_Loop' }), [0, SH, -8.55], 0);
  lucien.userData.blade.visible = false; lucien.userData.bladeGlow.visible = false; X.hubAnchors.lucien = lucien;
  const drummer = add(ch.person({ hub: true, seed: 11, female: false, outfit: 'peasant', pose: 'Sitting_Idle_Loop' }), [-1.9, SH, -9.45], 0.25);
  const drum = solid([cy(0.36, 0.33, 0.5, 12, 0x6a3a22, [0, 0.25, 0]), cy(0.37, 0.37, 0.04, 12, 0xd8c8a0, [0, 0.52, 0]), cy(0.38, 0.38, 0.05, 12, 0x3a2a1a, [0, 0.04, 0])]);
  drum.position.set(-1.7, SH, -8.85); g.add(drum);
  const sticks = [-1, 1].map((sd) => { const m = solid([cy(0.012, 0.016, 0.42, 4, 0xc8a878, [0, 0.21, 0])]); m.position.set(-1.7 + sd * 0.16, SH + 0.62, -9.05); g.add(m); return m; });
  const lutist = add(ch.person({ hub: true, seed: 23, female: true, outfit: 'ranger', pose: 'Idle_Loop' }), [1.85, SH, -9.25], -0.35);
  const lute = C.creature('lute', { h: 0.85 }); if (lute) C.attach(lutist, 'spine_03', lute, [0.05, -0.05, 0.22], [0.3, 0, 1.15]);
  const fiddler = add(ch.person({ hub: true, seed: 37, female: false, outfit: 'ranger', pose: 'Idle_Talking_Loop' }), [1.0, SH, -9.6], -0.15);
  C.attach(fiddler, 'hand_l', solid([bx(0.09, 0.32, 0.04, 0x7a3a1a, [0, 0.14, 0]), bx(0.02, 0.2, 0.02, 0x2a1a10, [0, 0.38, 0])]), [0, 0.05, 0.04], [0, 0, 0.6]);
  // the crowd: benches at the long tables, the bar, the hearth, a few in front of the stage
  const crowd = [];
  const sitAt = (x, z, yaw, seed) => crowd.push({ c: add(ch.person({ hub: true, seed, pose: 'Sitting_Idle_Loop' }), [x, 0, z], yaw), sit: true });
  tables.forEach((t, i) => {
    sitAt(t[0] - 0.62, t[1] - 0.45, Math.PI / 2, 100 + i * 7); sitAt(t[0] + 0.62, t[1] + 0.4, -Math.PI / 2, 101 + i * 7);
    if (i !== 1) sitAt(t[0] - 0.62, t[1] + 0.55, Math.PI / 2, 102 + i * 7);
  });
  sitAt(2.7, -5.9, Math.PI / 2, 140); sitAt(2.7, -4.6, Math.PI / 2, 141);
  const stand = (x, z, yaw, seed, pose) => crowd.push({ c: add(ch.person({ hub: true, seed, pose: pose || 'Idle_Talking_Loop' }), [x, 0, z], yaw), sit: false });
  stand(-4.2, -3.9, 1.9, 150); stand(-4.0, -1.2, 1.2, 151);
  stand(1.3, -6.2, -0.4, 160, 'Idle_Loop'); stand(2.1, -5.4, -0.6, 161, 'Idle_Loop'); stand(1.2, -4.6, -0.2, 162, 'Idle_Loop');  // crowd in front of the stage, right of the aisle (the brothers' table is left)
  // the brothers at the front table, facing the stage: you meet them here before you see them in the songs
  const ced = add(ch.cedric({ hub: true, pose: 'Sitting_Idle_Loop', noStaff: true }), [-1.55, 0, -4.6], Math.PI * 0.9);
  const art = add(ch.arthas({ hub: true, pose: 'Idle_Loop' }), [-2.55, 0, -5.1], Math.PI * 0.75);
  const tb = C.place('Table_Large', [-2.0, 0, -4.1], 0); if (tb) { tb.scale.set(0.45, 1, 0.75); g.add(tb); }
  const stool = C.place('Stool', [-1.55, 0, -4.6], 0); if (stool) g.add(stool);
  C.place && [[-2.25, -4.0, 0.3], [-1.75, -4.2, 1.9]].forEach((m) => { const o = C.place('Mug', [m[0], 0.81, m[1]], m[2]); if (o) g.add(o); });
  const staff = solid([cy(0.022, 0.022, 2.0, 5, 0x5a3a2a, [0, 1.0, 0])]); staff.position.set(-1.0, 0, -4.9); staff.rotation.z = -0.25; g.add(staff);
  X.hubAnchors.cedric = ced; X.hubAnchors.arthas = art;
  const keep = add(ch.person({ hub: true, seed: 170, female: false, outfit: 'peasant', pose: 'Idle_Talking_Loop' }), [5.25, 0, -3.2], -Math.PI / 2);
  const colliders = [{ x0: -2.95, x1: 2.95, z0: -10.2, z1: -7.75 }];
  colliders.push({ x: -2.0, z: -4.4, r: 1.0 });
  crowd.filter((p) => !p.sit).forEach((p) => colliders.push({ x: p.c.position.x, z: p.c.position.z, r: 0.35 }));
  let playing = null;
  return {
    colliders, lucien,
    update(t, ctx) {
      const on = !!(ctx.ride && t >= 0);
      if (on !== playing) {
        playing = on;
        lucien.userData.pose(on ? 'Spell_Simple_Idle_Loop' : 'Idle_Talking_Loop');
        fiddler.userData.pose(on ? 'Dance_Loop' : 'Idle_Talking_Loop');
        crowd.forEach((p, i) => { if (!p.sit) p.c.userData.pose(on ? (i % 2 ? 'Dance_Loop' : 'Idle_Torch_Loop') : (i % 3 ? 'Idle_Talking_Loop' : 'Idle_Loop')); });
      }
      // drumsticks on the beat when the band plays
      const B = on && X.story && X.story.beats ? X.story.beats.beats : null;
      let hit = 0;
      if (B) { let k = 0; while (k < B.length - 1 && B[k + 1] <= t) k++; hit = Math.exp(-(t - B[k]) * 9); }
      sticks.forEach((m, i) => { m.rotation.x = -0.9 + (i ? hit : 1 - hit) * 0.7; });
      glows.forEach((s) => { s.material.opacity = 0.6 + 0.1 * Math.sin(ctx.time * 9 + s.position.x); });
    }
  };
}

/* The tavern: the permanent hub every song starts and ends in. */
C.buildBar = function (X) {
  const g = new THREE.Group(), Z0 = X.Z0, kit = C.kit(X);
  const wallMat = new THREE.MeshLambertMaterial({ map: X.TEX.plank, color: 0xb89a7a });
  const HAS = C.hasModel('Table_Large'), wallTex = C.tex('wood_plank_wall_diff');
  // photo planks: one material per wall so the texture repeats at a real-world scale (~2.5 m per tile)
  const mk = (w, h, d, x, y, z) => {
    let mat = wallMat;
    if (wallTex) mat = new THREE.MeshLambertMaterial({ map: C.tex('wood_plank_wall_diff', Math.max(w, d) / 2.5, h / 2.5), color: 0xa08868 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m;
  };
  mk(12.8, 4.2, 0.4, 0, 2.1, 5.7);
  mk(5.1, 4.2, 0.4, -3.85, 2.1, -10.2); mk(5.1, 4.2, 0.4, 3.85, 2.1, -10.2); mk(2.6, 1.2, 0.4, 0, 3.6, -10.2);
  mk(0.4, 4.2, 15.9, -6.2, 2.1, -2.25); mk(0.4, 4.2, 15.9, 6.2, 2.1, -2.25);
  const ftReal = C.tex('old_wood_floor_diff', 4, 5.2), ft = ftReal || X.TEX.plank.clone(); ft.needsUpdate = true; if (!ftReal) ft.repeat.set(3, 5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 15.5), new THREE.MeshLambertMaterial({ map: ft, color: ftReal ? 0x9a8068 : 0xcdb394 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -2.25); g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 15.5), new THREE.MeshLambertMaterial({ color: 0x2a1d14 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.2, -2.25); g.add(ceil);

  const wood = 0x4a3222, dark = 0x2c1e14, stone = 0x3a3638;
  const P = [];
  [-8.5, -5, -1.5, 2, 5].forEach((z) => P.push(bx(12, 0.35, 0.35, dark, [0, 4.0, z])));
  P.push(bx(0.35, 0.35, 15.5, dark, [-3, 4.0, -2.25]), bx(0.35, 0.35, 15.5, dark, [3, 4.0, -2.25]));
  // fireplace on the left wall
  const FP = [[1.0, 0.4, 3.2, -5.3, 0.2, -2.5], [1.0, 2.6, 0.7, -5.3, 1.3, -4.0], [1.0, 2.6, 0.7, -5.3, 1.3, -1.0], [1.0, 0.5, 3.2, -5.3, 2.65, -2.5], [0.8, 1.5, 2.6, -5.4, 3.65, -2.5]];
  if (C.tex('rustic_stone_wall_diff')) {
    FP.forEach((b) => { const m = new THREE.Mesh(new THREE.BoxGeometry(b[0], b[1], b[2]), new THREE.MeshLambertMaterial({ map: C.tex('rustic_stone_wall_diff', Math.max(b[0], b[2]) / 1.6, b[1] / 1.6), color: 0x8a8480 })); m.position.set(b[3], b[4], b[5]); g.add(m); });
  } else FP.forEach((b) => P.push(bx(b[0], b[1], b[2], stone, [b[3], b[4], b[5]])));
  P.push(cy(0.1, 0.1, 1.2, 6, 0x3a2a1c, [-5.2, 0.5, -2.8], [0, 0, Math.PI / 2]), cy(0.1, 0.1, 1.2, 6, 0x3a2a1c, [-5.2, 0.6, -2.2], [0.3, 0, Math.PI / 2]));
  // bar counter and shelves on the right
  // the counter and its top in photo planks; shelves stay simple
  const cTex = C.tex('wood_plank_wall_diff', 3, 0.5), cTop = C.tex('old_wood_floor_diff', 0.6, 3);
  if (cTex) {
    const box = (w, h, d, x, y, z, map, col) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ map, color: col })); m.position.set(x, y, z); g.add(m); };
    box(1.3, 1.1, 7.5, 4.1, 0.55, -4.7, cTex, 0x8a6a50); box(1.5, 0.1, 7.7, 4.0, 1.12, -4.7, cTop, 0x6a5040);
  } else P.push(bx(1.3, 1.1, 7.5, wood, [4.1, 0.55, -4.7]), bx(1.5, 0.1, 7.7, dark, [4.0, 1.12, -4.7]));
  P.push(bx(0.4, 0.08, 7, wood, [5.6, 1.9, -4.7]), bx(0.4, 0.08, 7, wood, [5.6, 2.6, -4.7]));
  if (!HAS) for (let i = 0; i < 18; i++) {
    const col = [0x8a5a1a, 0x2a5a3a, 0x5a3a22, 0x7a2a2a][i % 4];
    P.push(cy(0.07, 0.08, 0.34, 6, col, [5.55, 2.1, -7.9 + i * 0.4]), cy(0.07, 0.08, 0.34, 6, col, [5.55, 2.8, -7.9 + i * 0.4 + 0.1]));
  }
  if (!HAS) for (let i = 0; i < 6; i++) P.push(cy(0.09, 0.08, 0.16, 7, 0x9a9aa0, [3.95, 1.25, -7.4 + i * 1.15]));
  // stools, one knocked over
  if (!HAS) [-7.2, -5.9, -4.6, -2.0].forEach((z) => P.push(cy(0.22, 0.22, 0.07, 8, wood, [2.7, 0.72, z]), cy(0.04, 0.05, 0.7, 5, dark, [2.7, 0.36, z])));
  if (!HAS) P.push(cy(0.22, 0.22, 0.07, 8, wood, [2.4, 0.2, -3.3], [0, 0, Math.PI / 2]), cy(0.04, 0.05, 0.7, 5, dark, [2.75, 0.2, -3.3], [0, 0, Math.PI / 2]));
  // round tables with tankards and a few small chairs
  const tables = [[-3.2, -6.3], [-3.0, -0.8], [-2.8, 2.6]];
  if (!HAS) tables.forEach((t) => {
    P.push(cy(0.9, 0.9, 0.08, 10, wood, [t[0], 0.8, t[1]]), cy(0.12, 0.16, 0.8, 6, dark, [t[0], 0.4, t[1]]));
    P.push(cy(0.07, 0.06, 0.14, 7, 0x9a9aa0, [t[0] + 0.4, 0.91, t[1] + 0.2]), cy(0.07, 0.06, 0.14, 7, 0x9a9aa0, [t[0] - 0.3, 0.91, t[1] - 0.3]));
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + t[1], cx = t[0] + Math.cos(a) * 1.25, cz = t[1] + Math.sin(a) * 1.25;
      P.push(bx(0.5, 0.06, 0.5, wood, [cx, 0.48, cz], [0, -a, 0]), bx(0.5, 0.55, 0.05, wood, [cx + Math.cos(a) * 0.23, 0.8, cz + Math.sin(a) * 0.23], [0, -a + Math.PI / 2, 0]),
        cy(0.03, 0.03, 0.48, 5, dark, [cx, 0.24, cz]));
    }
  });
  g.add(solid(P));
  if (HAS) dressBar(g, tables);
  const stage = stageAndCrowd(X, g, tables);

  // hanging lanterns and the single red d20 on the middle table
  const lanternPos = [[-2.5, 3.1, -2], [2.2, 3.1, -6.5], [0, 3.1, 1.5]];
  const lm = new THREE.MeshBasicMaterial({ color: 0xffc880 });
  lanternPos.forEach((p) => {
    const ch = C.place('Chandelier', [p[0], p[1] - 0.4, p[2]], 0, 0.9);  // candle chandeliers (model) instead of box lanterns
    if (ch) g.add(ch);
    else { const m = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.28), lm); m.position.set(p[0], p[1], p[2]); g.add(m); }
    const s = X.glow(0xffb060, 3.2, 0.7); s.position.set(p[0], p[1], p[2]); g.add(s);
    g.add(solid([cy(0.01, 0.01, 1.0, 4, 0x222222, [p[0], p[1] + 0.7, p[2]])]));
  });
  const d20 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), new THREE.MeshBasicMaterial({ color: 0xa81818 }));
  d20.position.set(-3.0, 1.06, -0.8); g.add(d20);
  const d20g = X.glow(0xff3030, 0.9, 0.5); d20g.position.copy(d20.position); g.add(d20g);

  const fire = kit.fire({ scale: 1.1, size: 5 });
  fire.group.position.set(-5.2, 0.35, -2.5); g.add(fire.group);

  // windows: warm outside, dark blue inside
  const winIn = [], winOut = [];
  [-6, -1.5, 3].forEach((z) => {
    [[-1, 1], [1, -1]].forEach((s) => {
      const x = s[0] * 6.0;
      winIn.push(part(new THREE.PlaneGeometry(1.2, 1.5), 0x2a3a58, M([x - s[0] * 0.02, 2.0, z], [0, -s[0] * Math.PI / 2, 0])));
      winOut.push(part(new THREE.PlaneGeometry(1.2, 1.5), 0xffc878, M([x + s[0] * 0.43, 2.0, z], [0, s[0] * Math.PI / 2, 0])));
    });
  });
  g.add(emis(winIn)); g.add(emis(winOut));

  // exterior shell: roof, gables, door frame, porch lanterns
  const rise = 3.2, hd = 8.15, ang = Math.atan2(rise, hd), sl = Math.hypot(hd, rise) + 0.6;
  const shell = [
    bx(13.4, 0.3, sl, 0x2a2420, [0, 4.2 + rise / 2, -2.25 - hd / 2], [-ang, 0, 0]),
    bx(13.4, 0.3, sl, 0x2a2420, [0, 4.2 + rise / 2, -2.25 + hd / 2], [ang, 0, 0]),
    tri([-6.45, 4.2, -10.4], [-6.45, 4.2, 5.9], [-6.45, 4.2 + rise, -2.25], 0x4a3828), tri([6.45, 4.2, 5.9], [6.45, 4.2, -10.4], [6.45, 4.2 + rise, -2.25], 0x4a3828),
    bx(0.3, 3.4, 0.5, dark, [-1.45, 1.7, -10.3]), bx(0.3, 3.4, 0.5, dark, [1.45, 1.7, -10.3]),
    bx(0.6, 1.2, 0.6, 0x3a3236, [-4, 7.4, -2.5])
  ];
  g.add(solid(shell, { side: THREE.DoubleSide }));
  [-1.9, 1.9].forEach((x) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.2), lm); m.position.set(x, 2.6, -10.55); g.add(m);
    const s = X.glow(0xffb060, 2.8, 0.8); s.position.copy(m.position); g.add(s);
  });

  // the door: hinge at x=-1.3, swings outward when the ride starts
  const door = new THREE.Group(); door.position.set(-1.3, 0, -10.0);
  door.add(solid([bx(2.6, 3.1, 0.15, 0x3a2818, [1.3, 1.55, 0]), bx(2.6, 0.12, 0.2, 0x2a2a30, [1.3, 0.7, 0]), bx(2.6, 0.12, 0.2, 0x2a2a30, [1.3, 2.4, 0]), bx(0.08, 0.3, 0.1, 0x8a8a90, [2.3, 1.5, 0.12])]));
  g.add(door);

  const colliders = [
    { x0: 3.15, x1: 6, z0: -8.8, z1: -0.8 }, { x0: -6, x1: -4.7, z0: -4.2, z1: -0.8 },
    { x: X.STAND.x, z: X.STAND.z - 1.15, r: 0.4 }  // Lucien's music stand
  ].concat(stage ? stage.colliders : []);
  tables.forEach((t) => colliders.push({ x: t[0], z: t[1], r: 1.05 }));
  colliders.push({ x0: -5.7, x1: -4.1, z0: 4.0, z1: 5.5 }, { x0: -4.4, x1: -2.8, z0: 4.9, z1: 5.5 }, { x0: 2.8, x1: 4.4, z0: 4.9, z1: 5.5 });  // chest, bookcases
  [-7.2, -5.9, -4.6, -2.0].forEach((z) => colliders.push({ x: 2.7, z, r: 0.35 }));

  return {
    group: g, colliders,
    update(t, ctx) {
      fire.update(ctx.time);
      const f = fire.flicker(ctx.time);
      d20.rotation.y = ctx.time * 0.4; d20.rotation.x = 0.4 + Math.sin(ctx.time * 0.3) * 0.1;
      d20g.material.opacity = 0.4 + 0.15 * Math.sin(ctx.time * 1.7);
      // the back door (behind the stage) swings open when the song's camera flies out through it
      const dA = X.story && X.story.doorAt !== undefined ? X.story.doorAt : 1.5;
      door.rotation.y = ctx.ride ? 1.5 * ss(dA - 4.5, dA - 2.5, t) : 0;  // fully open before the camera reaches it
      if (stage) stage.update(t, ctx);
      if (ctx.camD < 40) {
        ctx.light(0, -4.75, 0.9, -2.5, 0xff8a3a, 1.8 * f, 22);
        ctx.light(1, 0, 3.2, -6.6, 0xffc27a, 1.5, 22);  // stage wash
      }
    }
  };
};
})(typeof window !== 'undefined' ? window : globalThis);
