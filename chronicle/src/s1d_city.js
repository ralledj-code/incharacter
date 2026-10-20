(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, M, bx, cy, cn, ic, part, solid, emis, inst, lamb, R, pick } = C;
const SC = C.scenes.baphomet;

const crowdGeo = () => C.merge([
  cy(0.2, 0.28, 1.1, 6, 0xffffff, [0, 0.75, 0]), ic(0.17, 1, 0xffffff, [0, 1.45, 0]),
  cy(0.09, 0.1, 0.55, 5, 0xffffff, [-0.1, 0.27, 0]), cy(0.09, 0.1, 0.55, 5, 0xffffff, [0.1, 0.27, 0])]);
const TONES = [0x6a3a2a, 0x3a4a5a, 0x5a4a2a, 0x4a2a3a, 0x2a4a3a, 0x7a6a4a, 0x3a3a48];

/* ---- the march to Cobh, the gate, and the feast street ---- */
SC.push(function (X) {
  const S1 = X.sec.bridge, S2 = X.sec.bridge2, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
  const dG = X.distAt(S1.t0 + 13), dE = X.dBack - 2;
  g.add(kit.trees(S1.d0 - 12, dG - 8, { minSide: 12, maxSide: 36, dens: 0.7, deadP: 0.1, tint: 0xc0a078 }));
  const tl = [];
  for (let d = S1.d0 + 2; d < dG - 8; d += 5) { const a = X.at(d, -4.8, 0), b = X.at(d + 2.5, 4.8, 0); tl.push({ x: a.x, z: a.z }, { x: b.x, z: b.z }); }
  const tor = kit.torches(tl, { glow: 0xffc070, size: 3.4, op: 0.85 }); g.add(tor.group);

  // cheering crowd lining the road
  const cr = [], NCR = X.mobile ? 36 : 60;
  for (let i = 0; i < NCR; i++) { const d = R(S1.d0 + 4, dG - 10), sd = (i % 2 ? 1 : -1) * R(6.2, 9.5), p = X.at(d, sd, 0); cr.push({ p, ph: R(0, TAU), yaw: X.yawAt(d) + (sd > 0 ? -Math.PI / 2 : Math.PI / 2) + R(-0.4, 0.4), s: R(0.85, 1.1) }); }
  const crowd = new THREE.InstancedMesh(crowdGeo(), lamb(), NCR); crowd.frustumCulled = false; g.add(crowd);
  cr.forEach((c, i) => crowd.setColorAt(i, new THREE.Color(pick(TONES))));
  const dm = new THREE.Object3D();

  // the gate
  const G = new THREE.Group(); G.position.copy(X.at(dG, 0, 0)); G.rotation.y = X.yawAt(dG); g.add(G);
  const stone = 0x5a5a62, GP = [
    cy(3.6, 4.0, 15, 10, stone, [-8.6, 7.5, 0]), cy(3.6, 4.0, 15, 10, stone, [8.6, 7.5, 0]),
    cn(4.8, 5.2, 10, 0x5a2e2e, [-8.6, 17.6, 0]), cn(4.8, 5.2, 10, 0x5a2e2e, [8.6, 17.6, 0]),
    bx(36, 8, 3.2, stone, [-30, 4, 0]), bx(36, 8, 3.2, stone, [30, 4, 0]), bx(10.6, 3.6, 3.4, stone, [0, 8.8, 0])
  ];
  for (let i = -3; i <= 3; i++) GP.push(cy(0.07, 0.07, 2.6, 5, 0x3a3a40, [i * 0.7, 6.9, 0]));
  for (let i = -8; i <= 8; i++) { GP.push(bx(1.4, 1.0, 3.4, stone, [-30 + i * 2.2, 8.5, 0]), bx(1.4, 1.0, 3.4, stone, [30 + i * 2.2, 8.5, 0])); }
  G.add(solid(GP));
  const gl = []; [-8.6, 8.6].forEach((x) => { [3.5, 9, 12.5].forEach((y) => gl.push(part(new THREE.PlaneGeometry(0.6, 1.1), 0xffc070, M([x, y, -3.7])))); });
  G.add(emis(gl, { side: THREE.DoubleSide }));
  const gt = []; [-5.8, 5.8].forEach((x) => { gt.push({ x: G.position.x + Math.cos(G.rotation.y) * x, z: G.position.z - Math.sin(G.rotation.y) * x }); });
  const gtor = kit.torches(gt, { glow: 0xffc070, size: 4, op: 0.9 }); g.add(gtor.group);

  // the feast street
  const street = [];
  for (let d = dG + 9; d < dE; d += 8.5) {
    [-1, 1].forEach((sg) => {
      const w = R(6, 8.5), dep = R(6, 8), h = R(4.6, 7), hs = kit.house({ w, d: dep, h, wall: pick([0x6a5444, 0x5a4a50, 0x6a5a40]), roof: pick([0x3a2a2e, 0x2e2a36]), light: pick([0xffc070, 0xff9ab0, 0xffd090]) });
      const p = X.at(d + R(-1, 1), sg * (8.8 + w / 2 * 0.35 + 3), 0); hs.position.copy(p); kit.placeFacing(hs, d, sg);
      street.push({ x: p.x, z: p.z, yaw: hs.rotation.y, w: w > 7.2 ? 6 : 4, d: dep > 7 ? 6 : 4, st: h > 5.6 ? 2 : 1, brick: R(0, 1) < 0.3, box: hs });
    });
  }
  // modular kit houses when loaded, else the procedural boxes
  const vil = kit.village(street);
  if (vil) g.add(vil); else street.forEach((s) => g.add(s.box));
  const bulbs = [], bcol = [];
  for (let d = dG + 5; d < dE - 2; d += 6.5) {
    for (let k = 0; k < 9; k++) { const u = k / 8, p = X.at(d, lerp(-9, 9, u), 5.8 - 1.1 * Math.sin(u * Math.PI)); bulbs.push(M([p.x, p.y, p.z], null, 1)); bcol.push(pick([0xffc070, 0xff7a9a, 0x70c8ff, 0xffe080])); }
  }
  const bm = new THREE.InstancedMesh(C.merge([part(new THREE.SphereGeometry(0.14, 6, 5), 0xffffff)]), new THREE.MeshBasicMaterial({ vertexColors: true }), bulbs.length);
  bulbs.forEach((m, i) => { bm.setMatrixAt(i, m); bm.setColorAt(i, new THREE.Color(bcol[i])); }); bm.frustumCulled = false; g.add(bm);
  const dB = dG + (dE - dG) * 0.45, bpos = X.at(dB, 7.0, 0), bon = kit.fire({ scale: 2.0, size: 9 }); bon.group.position.set(bpos.x, 0, bpos.z); g.add(bon.group);
  const dancers = [], ND = 16;
  for (let i = 0; i < ND; i++) { const a = i / ND * TAU; dancers.push({ x: bpos.x + Math.cos(a) * 3.4, z: bpos.z + Math.sin(a) * 3.4, ph: R(0, TAU), a }); }
  const dance = new THREE.InstancedMesh(crowdGeo(), lamb(), ND); dance.frustumCulled = false; g.add(dance);
  dancers.forEach((c, i) => dance.setColorAt(i, new THREE.Color(pick([0xc05a6a, 0x5a8ac0, 0xc0a050, 0x7ac08a]))));

  // the three of them walk ahead, carrying the wyrm's head
  const marchers = new THREE.Group(); g.add(marchers);
  const ced = ch.cedric({ pose: 'Walk_Loop' }), lu = ch.lucien({ pose: 'Walk_Loop' }), art = ch.arthas({ pose: 'Walk_Formal_Loop' });
  ced.position.set(-1.7, 0, 0); lu.position.set(0, 0, -0.6); art.position.set(1.8, 0, 0); marchers.add(ced); marchers.add(lu); marchers.add(art);
  lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
  const head = new THREE.Group(); head.add(solid([bx(0.8, 0.6, 1.1, 0x1c1618, [0, 0, 0]), bx(0.55, 0.4, 0.95, 0x1c1618, [0, -0.05, -0.95]), bx(0.5, 0.18, 0.85, 0x3a2626, [0, -0.4, -0.85], [0.35, 0, 0]), cn(0.12, 0.8, 4, 0x2a2224, [-0.3, 0.45, 0.3], [1, 0, 0.3]), cn(0.12, 0.8, 4, 0x2a2224, [0.3, 0.45, 0.3], [1, 0, -0.3])]));
  head.position.set(-1.2, 3.6, 0); head.rotation.y = Math.PI; head.scale.setScalar(0.9); marchers.add(head);
  marchers.add(solid([cy(0.04, 0.04, 3.4, 5, 0x5a3a2a, [-1.2, 1.7, 0])]));

  return {
    group: g, d0: S1.d0, d1: dE, vis: 100,
    update(t, ctx) {
      tor.update(ctx.time); gtor.update(ctx.time); bon.update(ctx.time);
      for (let i = 0; i < NCR; i++) { const c = cr[i]; dm.position.set(c.p.x, Math.abs(Math.sin(ctx.time * 5 + c.ph)) * 0.18, c.p.z); dm.rotation.set(0, c.yaw, 0); dm.scale.setScalar(c.s); dm.updateMatrix(); crowd.setMatrixAt(i, dm.matrix); }
      crowd.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < ND; i++) { const c = dancers[i]; dm.position.set(c.x, Math.abs(Math.sin(ctx.time * 6 + c.ph)) * 0.3, c.z); dm.rotation.set(0, c.a + ctx.time * 0.8, 0.12 * Math.sin(ctx.time * 6 + c.ph)); dm.scale.setScalar(1); dm.updateMatrix(); dance.setMatrixAt(i, dm.matrix); }
      dance.instanceMatrix.needsUpdate = true;
      marchers.visible = t < S2.t0 + 9;
      if (marchers.visible) {
        const dc = Math.min(ctx.camD + 11, dE - 1), p = X.at(dc, 0, 0);
        marchers.position.set(p.x, ced.userData.mixer ? 0 : Math.abs(Math.sin(ctx.time * 3.2)) * 0.06, p.z); marchers.rotation.y = X.yawAt(dc) + Math.PI;
      }
      const gp = X.at(clamp(ctx.camD + 6, dG - 30, dE), 0, 5);
      ctx.light(0, gp.x, 7, gp.z, 0xffc880, 1.2, 36);
      ctx.light(1, bpos.x, 2.2, bpos.z, 0xff9a50, 2.4 * bon.flicker(ctx.time), 32);
    }
  };
});

/* ---- iron: the cell at the end of the street ---- */
SC.push(function (X) {
  const kit = C.kit(X), g = new THREE.Group();
  const dBars = X.Dend + 2.4, dc = (X.dBack + dBars) / 2, L = dBars - X.dBack, HW = 2.5, H = 3.6;
  const G = new THREE.Group(); G.position.copy(X.at(dc, 0, 0)); G.rotation.y = X.yawAt(dc); g.add(G);
  const stoneMat = (rx, ry, floor) => {
    // photo brick walls and cobbled floor when loaded (about 2 m per tile), else the procedural stone
    const real = C.tex(floor ? 'cobblestone_floor_04_diff' : 'castle_brick_07_diff', rx, ry);
    if (real) return new THREE.MeshLambertMaterial({ map: real, color: floor ? 0x8a8c94 : 0x9a9ca6, side: THREE.DoubleSide });
    const t = X.TEX.stone.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshLambertMaterial({ map: t, color: 0xa0a4ae, side: THREE.DoubleSide });
  };
  const plane = (w, h, rx, ry, x, y, z, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), stoneMat(rx, ry, rot[0] === -Math.PI / 2)); m.position.set(x, y, z); m.rotation.set(rot[0], rot[1], rot[2]); G.add(m); };
  plane(L, H, L / 2, 1.5, -HW, H / 2, 0, [0, Math.PI / 2, 0]); plane(L, H, L / 2, 1.5, HW, H / 2, 0, [0, -Math.PI / 2, 0]);
  plane(1.3, H, 0.6, 1.5, -1.85, H / 2, L / 2, [0, Math.PI, 0]); plane(1.3, H, 0.6, 1.5, 1.85, H / 2, L / 2, [0, Math.PI, 0]); plane(2.4, 0.6, 1, 0.3, 0, H - 0.3, L / 2, [0, Math.PI, 0]);
  plane(HW * 2, L, 2, L / 2, 0, 0, 0, [-Math.PI / 2, 0, 0]); plane(HW * 2, L, 2, L / 2, 0, H, 0, [Math.PI / 2, 0, 0]);
  const iron = 0x2a2c32, P = [];
  for (let i = 0; i <= 16; i++) P.push(cy(0.04, 0.04, H, 6, iron, [-HW + i * (HW * 2 / 16), H / 2, -L / 2]));
  [0.25, 1.8, 3.3].forEach((y) => P.push(bx(HW * 2, 0.1, 0.1, iron, [0, y, -L / 2])));
  P.push(cy(0.2, 0.17, 0.35, 8, 0x3a3a40, [1.6, 0.18, L / 2 - 2.5]), bx(0.4, 0.4, 0.4, 0x4a3222, [1.4, 0.2, L / 2 - 3.1]));
  for (let i = 0; i < 12; i++) P.push(bx(R(0.4, 0.9), 0.08, R(0.2, 0.5), 0xa89050, [-1.7 + R(-0.4, 0.4), 0.05 + 0.02 * (i % 3), L / 2 - 2.2 + R(-0.7, 0.7)], [0, R(0, 3), 0]));
  P.push(cy(0.03, 0.03, 0.14, 5, 0xe8e0c0, [1.4, 0.47, L / 2 - 3.1]));
  const wb = []; for (let i = -1; i <= 1; i++) wb.push(cy(0.03, 0.03, 0.9, 5, iron, [HW - 0.05, 2.4, -2 + i * 0.28]));
  G.add(solid(P.concat(wb)));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.9), new THREE.MeshBasicMaterial({ color: 0x5a7aa8 })); win.position.set(HW - 0.02, 2.4, -2); win.rotation.y = -Math.PI / 2; G.add(win);
  const ch = []; for (let c = 0; c < 2; c++) for (let k = 0; k < 8; k++) ch.push(M([-HW + 0.06, 2.8 - k * 0.27, -1.5 + c * 1.1], [0, k % 2 ? Math.PI / 2 : 0, Math.PI / 2], [1.5, 1, 1]));
  G.add(inst(kit.linkGeo, lamb({ color: 0x9aa0ac }), ch));
  const cg = X.glow(0xffb060, 1.6, 0.8); cg.position.set(1.4, 0.55, L / 2 - 3.1); G.add(cg);
  const door = new THREE.Group(); door.position.set(-1.2, 0, L / 2 - 0.05);
  door.add(solid([bx(2.4, 3.0, 0.14, 0x2e2a2a, [1.2, 1.5, 0]), bx(2.4, 0.12, 0.18, iron, [1.2, 0.6, 0]), bx(2.4, 0.12, 0.18, iron, [1.2, 2.3, 0]), bx(0.1, 0.34, 0.1, 0x8a8a90, [2.1, 1.4, -0.1])]));
  G.add(door);
  const tT = X.tCross + 1.1;
  return {
    group: g, d0: X.dBack - 6, d1: X.Dend + 6, vis: 25,
    update(t, ctx) {
      door.rotation.y = 1.6 * (1 - ss(tT, tT + 0.4, t));
      const wp = G.localToWorld(new THREE.Vector3(1.4, 1.0, L / 2 - 2.6));
      ctx.light(0, wp.x, wp.y, wp.z, 0xffa860, 1.3 * (0.85 + 0.15 * Math.sin(ctx.time * 13) * Math.sin(ctx.time * 5)), 14);
    }
  };
});

/* ---- Cobh burns; the wraith comes ---- */
SC.push(function (X) {
  const S = X.sec.outro, Sf = X.sec.final, kit = C.kit(X), g = new THREE.Group();
  const d0 = X.Dend + 8, fires = [], burnt = [], useKit = C.hasModel('Wall_Plaster_Straight');
  for (let d = d0; d < d0 + 90; d += 8.5) {
    [-1, 1].forEach((sg) => {
      const w = R(6, 8.5), dep = R(6, 8), h = R(4.6, 7.5), hs = kit.house({ w, d: dep, h, wall: 0x3a3030, roof: 0x242026, light: 0xff7a30 });
      const p = X.at(d + R(-1, 1), sg * (9 + R(0, 6)), 0); hs.position.copy(p); kit.placeFacing(hs, d, sg);
      const st = h > 5.6 ? 2 : 1;
      if (useKit) burnt.push({ x: p.x, z: p.z, yaw: hs.rotation.y, w: w > 7.2 ? 6 : 4, d: dep > 7 ? 6 : 4, st, brick: R(0, 1) < 0.4 }); else g.add(hs);
      if (R(0, 1) < 0.75) { const f = kit.fire({ scale: R(1.2, 2.2), size: 7 }); f.group.position.set(p.x, useKit ? st * 3.12 + 2.2 : h + 1.6, p.z); g.add(f.group); fires.push(f); }
    });
  }
  // scorched kit houses with fire-lit windows
  if (burnt.length) g.add(kit.village(burnt, { tint: 0x4a4040, glass: 0xff7a30 }));
  // the wraith
  const wr = new THREE.Group(), cloak = 0x0b0d14;
  const WP = [cn(4.2, 15, 10, cloak, [0, 7.5, 0]), bx(5, 1.2, 2, 0x10121a, [0, 14.2, 0]), ic(1.7, 1, 0x080a10, [0, 15.4, 0], [1, 1.2, 1]), cn(1.2, 2.4, 6, 0x080a10, [0, 17.2, -0.3])];
  [-1, 1].forEach((sg) => { WP.push(cy(0.3, 0.12, 7.5, 5, 0x10121a, [sg * 3.0, 11, -3.2], [-0.9, 0, sg * -0.15])); for (let k = -1; k <= 1; k++) WP.push(cn(0.07, 1.5, 4, 0xaab4c8, [sg * 3.3 + k * 0.28, 7.4, -6.6], [-1.7, 0, 0])); });
  wr.add(solid(WP));
  const strips = [];
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * TAU, len = R(5, 9), piv = new THREE.Group(); piv.position.set(Math.cos(a) * 3.9, 1.2, Math.sin(a) * 3.9); piv.rotation.y = -a;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, len), new THREE.MeshLambertMaterial({ color: 0x0e1018, side: THREE.DoubleSide })); m.position.y = -len / 2; piv.add(m); wr.add(piv); strips.push({ piv, ph: R(0, TAU) });
  }
  const eyes = [-0.55, 0.55].map((x) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.1), new THREE.MeshBasicMaterial({ color: 0xcfe8ff })); e.position.set(x, 15.5, 1.55); wr.add(e); return e; });
  const eg = X.glow(0x9cc8ff, 7, 0.9); eg.position.set(0, 15.5, 1.9); wr.add(eg);
  const halo = X.glow(0x6a90d0, 24, 0.28); halo.position.set(0, 15.2, 0.4); wr.add(halo);
  wr.rotation.y = X.yawAt(X.Dend); g.add(wr);
  return {
    group: g, d0: X.dBack - 8, d1: X.Dend + 5, vis: 30,
    update(t, ctx) {
      fires.forEach((f) => f.update(ctx.time));
      const k = ss(S.t0, X.sec.final.t1 - 12, t), p = X.at(X.Dend + lerp(78, 36, k), lerp(-12, -3, k), lerp(26, 13, k) + Math.sin(ctx.time * 0.5) * 0.8);
      wr.position.copy(p); wr.visible = t > S.t0 - 2;
      strips.forEach((s) => { s.piv.rotation.z = 0.15 * Math.sin(ctx.time * 1.3 + s.ph); s.piv.rotation.x = 0.12 * Math.cos(ctx.time * 1.1 + s.ph); });
      const flash = t >= 357 ? Math.exp(-(t - 357) * 1.5) : 0;
      eg.material.opacity = 0.7 + 0.2 * Math.sin(ctx.time * 2) + flash * 0.5;
      ctx.light(1, p.x, p.y - 4, p.z + 4, 0x80b0ff, (0.8 + 0.8 * k) * (1 - ss(356.5, 357.2, t)), 70);
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
