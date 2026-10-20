(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, M, bx, cy, cn, ic, solid, emis, inst, lamb, R } = C;
const SC = C.scenes.baphomet;

/* ---- 1. out of the door, down the lantern lane ---- */
SC.push(function (X) {
  const S = X.sec.intro, kit = C.kit(X), g = new THREE.Group();
  g.add(kit.trees(6, S.d1 + 25, { minSide: 6, maxSide: 40, dens: 1.1, deadP: 0.25, tint: 0x9aaabb }));
  const list = [];
  for (let d = 10; d < S.d1 + 6; d += 7) { const a = X.at(d, -3.2, 0), b = X.at(d + 3.5, 3.2, 0); list.push({ x: a.x, z: a.z }, { x: b.x, z: b.z }); }
  const tor = kit.torches(list, { glow: 0xffb060, size: 2.2, op: 0.6, color: 0xffc060 }); g.add(tor.group);
  // the brothers (and Neeris) already on the road, walking ahead of the camera toward the moonwell
  const ch = C.chars(X), walkers = ch.person ? [['lucien', -0.8, 0], ['cedric', 0.9, 1.2], ['arthas', -0.2, 2.6], ['neeris', 1.4, 4]].map(([k, sd, back]) => {
    const o = ch[k]({ pose: 'Walk_Loop' }); if (o.userData.blade) { o.userData.blade.visible = false; o.userData.bladeGlow.visible = false; } g.add(o); return { o, sd, back };
  }) : [];
  return { group: g, d0: S.d0, d1: S.d1, vis: 110, update(t, ctx) {
    tor.update(ctx.time);
    const camD0 = lerp(9, X.distAt(47.8) - 18, clamp((t - 32) / 15.8, 0, 1));  // the intro shot's camera path (L08 shots), walkers stay ahead of it
    walkers.forEach(({ o, sd, back }) => { const d = Math.max(14 + Math.max(0, t - 30) * 1.25, camD0 + 9) - back; o.visible = t > 28; o.position.copy(X.at(d, sd, 0)); o.rotation.y = X.yawAt(d) + Math.PI; });
  } };
});

/* ---- 2. the moonwell: blood, chains, Baphomet ---- */
SC.push(function (X) {
  const S = X.sec.v1, kit = C.kit(X), g = new THREE.Group();
  const TB = X.line(1, 0.1);        // "Baphomet's chains broke"
  const dw = S.d0 + S.len * 0.55, side = 6.5, wp = X.at(dw, side, 0);
  g.add(kit.trees(S.d0 - 15, S.d1 + 15, { minSide: 8, maxSide: 38, dens: 0.8, deadP: 0.5, tint: 0x8fa0b8 }));
  const well = new THREE.Group(); well.position.set(wp.x, 0, wp.z); g.add(well);
  const P = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; P.push(bx(1.0, 1.15, 0.7, 0x70747c, [Math.cos(a) * 2.0, 0.57, Math.sin(a) * 2.0], [0, -a + Math.PI / 2, 0])); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; P.push(bx(1.3, 5.2, 1.3, 0x5c6068, [Math.cos(a) * 11, 2.6, Math.sin(a) * 11], [0, R(0, 1), 0.04])); }
  well.add(solid(P));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.75, 24), new THREE.MeshBasicMaterial({ color: 0x7aa8ff }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 0.95; well.add(disc);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 60, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x7aa8ff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  col.position.y = 30; well.add(col);
  const wg = X.glow(0x7aa8ff, 9, 0.7); wg.position.y = 1.6; well.add(wg);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 40), new THREE.MeshBasicMaterial({ color: 0xff6040, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3; well.add(ring);

  // chains: 6 from the rim up to the standing stones
  const links = [], NL = 30;
  for (let c = 0; c < 6; c++) {
    const a = c / 6 * TAU + 0.3, A = new THREE.Vector3(Math.cos(a) * 1.8, 1.0, Math.sin(a) * 1.8), B = new THREE.Vector3(Math.cos(a) * 11, 5.0, Math.sin(a) * 11);
    const dir = B.clone().sub(A).normalize();
    for (let k = 0; k < NL; k++) {
      const u = k / (NL - 1), p = A.clone().lerp(B, u); p.y -= 1.2 * Math.sin(u * Math.PI);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(dir, k % 2 ? Math.PI / 2 : 0));
      const v = new THREE.Vector3(Math.cos(a) * R(1.5, 6) + R(-2, 2), R(3, 8), Math.sin(a) * R(1.5, 6) + R(-2, 2));
      const tg = (v.y + Math.sqrt(v.y * v.y + 19.6 * Math.max(0.1, p.y - 0.12))) / 9.8;
      links.push({ p, q, v, tg, w: new THREE.Vector3(R(-6, 6), R(-6, 6), R(-6, 6)) });
    }
  }
  const linkMesh = new THREE.InstancedMesh(kit.linkGeo, lamb({ color: 0xb8bcc8 }), links.length);
  linkMesh.frustumCulled = false; well.add(linkMesh);
  const dm = new THREE.Object3D(), qa = new THREE.Quaternion(), ea = new THREE.Euler();
  let lastTau = -99;
  function placeLinks(tau) {
    const tc = clamp(tau, 0, 8); if (tc === lastTau && tc === 8) return; lastTau = tc;
    links.forEach((l, i) => {
      const s = Math.min(tc, l.tg);
      if (tau <= 0) { dm.position.copy(l.p); dm.quaternion.copy(l.q); dm.scale.set(1.5, 1, 1); }
      else {
        dm.position.set(l.p.x + l.v.x * s, Math.max(0.12, l.p.y + l.v.y * s - 4.9 * s * s), l.p.z + l.v.z * s);
        ea.set(l.w.x * s, l.w.y * s, l.w.z * s); qa.setFromEuler(ea); dm.quaternion.copy(l.q).multiply(qa); dm.scale.set(1.5, 1, 1);
      }
      dm.updateMatrix(); linkMesh.setMatrixAt(i, dm.matrix);
    });
    linkMesh.instanceMatrix.needsUpdate = true;
  }

  // Baphomet rises from the well
  const bap = new THREE.Group(); const bp = [
    cn(1.5, 5.6, 9, 0x140a0c, [0, 2.8, 0]), bx(3.4, 0.9, 1.3, 0x1c0f12, [0, 5.5, 0]),
    cy(0.28, 0.3, 3.4, 6, 0x1c0f12, [-1.9, 4.2, 0.3], [0.4, 0, 0.25]), cy(0.28, 0.3, 3.4, 6, 0x1c0f12, [1.9, 4.2, 0.3], [0.4, 0, -0.25]),
    ic(0.75, 1, 0x20161a, [0, 6.5, 0], [1, 1.15, 1]), cn(0.42, 1.2, 5, 0x20161a, [0, 6.1, 0.8], [Math.PI / 2 + 0.3, 0, 0])
  ];
  [-1, 1].forEach((sg) => { for (let k = 0; k < 4; k++) bp.push(cn(0.22 - k * 0.04, 1.0, 5, 0x2e2424, [sg * (0.55 + 0.32 * k), 7.0 + 0.55 * k - 0.06 * k * k, -0.1], [0, 0, -sg * (0.45 + 0.3 * k)])); });
  bap.add(solid(bp));
  [-0.28, 0.28].forEach((x) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.08), new THREE.MeshBasicMaterial({ color: 0xff3020 })); e.position.set(x, 6.55, 0.62); bap.add(e); });
  const eg = X.glow(0xff3020, 3.2, 0.9); eg.position.set(0, 6.55, 0.7); bap.add(eg);
  bap.rotation.y = X.yawAt(dw) - Math.PI / 2; bap.position.y = -8; bap.visible = false; well.add(bap);
  // Baphomet: the rigged goat-headed giant (w3b_chars); the procedural figure above stays only as a fallback
  const ch = C.chars(X), L = X.line;
  const baph = ch.baphomet ? ch.baphomet({ h: 14, pose: 'Idle_Loop' }) : null;
  if (baph) {
    bap.children.forEach((c) => { c.visible = false; });
    const rp = X.at(dw, 0, 0), face = Math.atan2(rp.x - wp.x, rp.z - wp.z);  // face the brothers on the path side
    baph.rotation.y = face - bap.rotation.y; bap.add(baph);
    X.anchors.wellFace = Math.atan2(Math.cos(face), Math.sin(face));
  }
  X.anchors.well = well; X.anchors.baphomet = baph || bap;
  // the brothers (and Neeris) reach the well; staged on the lyric lines of verse 1
  const yw = X.yawAt(dw), wpos = new THREE.Vector3(wp.x, 0, wp.z);
  const spot = (side, back) => X.at(dw + back, side, 0);
  const art = ch.arthas({ pose: 'Walk_Loop' }), ced = ch.cedric({ pose: 'Walk_Loop' }), luc = ch.lucien({ pose: 'Walk_Loop' }), ner = ch.neeris({ pose: 'Walk_Loop' });
  [art, ced, luc, ner].forEach((o) => g.add(o));
  luc.userData.blade.visible = false; luc.userData.bladeGlow.visible = false;
  art.position.copy(spot(side - 8, -4)); ced.position.copy(spot(side - 9, -6)); luc.position.copy(spot(side - 9, -2)); ner.position.copy(spot(side - 10, -8));
  const TB2 = L(1, 0.1);
  const actors = [
    C.act(art, [
      { t: S.t0, to: spot(side - 3.4, 0.2), move: 1.5, face: wpos },                          // walks to the rim
      { t: L(0), pose: 'Fixing_Kneeling', face: wpos },                                        // "bled his hand into the well"
      { t: TB2, to: spot(side - 6, 0.6), move: 0.45, pose: 'Crouch_Idle_Loop', face: wpos },  // thrown back by the blast
      { t: L(1, 2), pose: 'Sword_Idle', face: wpos },
      { t: L(3), pose: 'Sword_Idle', face: ner }
    ]),
    C.act(ced, [
      { t: S.t0, to: spot(side - 5, -2.4), move: 2, face: wpos },
      { t: L(0), pose: 'Idle_Loop', face: wpos },
      { t: TB2, to: spot(side - 7.5, -3.2), move: 0.6, pose: 'Crouch_Idle_Loop', face: wpos },
      { t: L(2), pose: 'Idle_Loop', face: wpos }
    ]),
    C.act(luc, [
      { t: S.t0, to: spot(side - 5, 2.2), move: 2, face: wpos },
      { t: L(0), pose: 'Idle_Loop', face: wpos },
      { t: TB2, to: spot(side - 7.5, 3), move: 0.6, pose: 'Spell_Simple_Idle_Loop', face: wpos }
    ]),
    C.act(ner, [
      { t: S.t0, to: spot(side - 8, -4.5), move: 3, face: wpos },
      { t: L(1), pose: 'Idle_Loop', face: wpos },
      { t: L(3, 2.5), pose: 'Crouch_Idle_Loop', face: wpos }                                   // "the wolf-curse began to grow"
    ])
  ];
  if (baph) actors.push(C.act(baph, [
    { t: 0, pose: 'Idle_Loop' }, { t: L(2), pose: 'Idle_Talking_Loop' }, { t: L(3), pose: 'Spell_Simple_Idle_Loop' }, { t: L(3, 5), pose: 'Idle_Loop' }
  ]));
  // wolf eyes opening in the treeline when the curse grows
  const tlEyes = [];
  for (let i = 0; i < 9; i++) {
    const a = yw + Math.PI / 2 + (i - 4) * 0.25, r = 16 + (i % 3) * 2.5, e = X.glow(0xffa020, 0.45, 0);
    e.position.set(wp.x + Math.sin(a) * r, 0.8 + (i % 2) * 0.25, wp.z + Math.cos(a) * r); g.add(e); tlEyes.push(e);
  }
  X.anchors.arthasWell = art; X.anchors.lucienWell = luc; X.anchors.cedricWell = ced; X.anchors.neerisWell = ner;

  // blood falling into the well
  const NDR = 28, dp = new Float32Array(NDR * 3);
  const drGeo = new THREE.BufferGeometry(); drGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const drips = new THREE.Points(drGeo, new THREE.PointsMaterial({ size: 0.3, map: X.TEX.glow, color: 0xc01818, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  drips.frustumCulled = false; well.add(drips);

  return {
    group: g, d0: S.d0, d1: S.d1 + 30, vis: 90,
    update(t, ctx) {
      const tau = t - TB, red = sm(tau / 0.5);
      placeLinks(tau);
      disc.material.color.setHex(0x7aa8ff).lerp(new THREE.Color(0xff3a22), red);
      col.material.color.copy(disc.material.color); col.material.opacity = 0.14 + 0.1 * red * (0.7 + 0.3 * Math.sin(ctx.time * 3));
      wg.material.color.copy(disc.material.color);
      ring.material.opacity = tau > 0 && tau < 1.6 ? 0.9 * (1 - tau / 1.6) : 0; ring.scale.setScalar(1 + Math.max(0, tau) * 14);
      bap.visible = tau > 0.4; bap.position.y = -14 + 14 * sm((tau - 0.8) / 6.5);
      actors.forEach((a) => a.update(t, ctx));
      if (baph) {
        const spread = ss(L(2, -1), L(2, 1.5), t), flap = Math.sin(ctx.time * 1.6) * 0.12 * spread;
        baph.userData.wings.forEach((w, k) => { const sd = k ? 1 : -1; w.rotation.set(0, sd * (0.5 + 0.9 * spread), sd * flap); });
        const talk = t > L(2) && t < L(3, 6) ? 0.4 + 0.6 * Math.abs(Math.sin(ctx.time * 5)) : 0.35;
        baph.userData.eyeGlow.material.opacity = 0.6 + 0.4 * talk;
      }
      tlEyes.forEach((e, k) => { e.material.opacity = 0.9 * ss(L(3, 2.5 + k * 0.3), L(3, 3.2 + k * 0.3), t) * (Math.sin(ctx.time * 1.3 + k) > 0.95 ? 0.1 : 1); });
      const flash = tau > 0 ? Math.exp(-tau * 2.2) * 6 : 0;
      ctx.light(1, wp.x, 1.8 + (tau > 0 ? 4 : 0), wp.z, disc.material.color, 2.6 + flash + 0.3 * Math.sin(ctx.time * 4) + (tau > 0 ? 1.5 : 0), 40);  // the well lights him from below
      const on = (t > X.line(0, 1.5) && t < TB) ? 1 : 0; drips.visible = on > 0;  // Arthas's blood, from the moment he kneels
      if (on) for (let i = 0; i < NDR; i++) {
        const u = (ctx.time * 1.1 + i * 0.37) % 1, a = i * 2.4;
        dp[i * 3] = Math.cos(a) * 0.9 * (0.3 + u * 0.4); dp[i * 3 + 1] = 7 - u * 6.1; dp[i * 3 + 2] = Math.sin(a) * 0.9 * (0.3 + u * 0.4);
      }
      drGeo.attributes.position.needsUpdate = true;
    }
  };
});

/* ---- 3. the wolf wood and the blue dagger ---- */
SC.push(function (X) {
  const S1 = X.sec.v1b, S2 = X.sec.pre, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
  g.add(kit.trees(S1.d0 - 12, S2.d1 + 14, { minSide: 5, maxSide: 30, dens: 2.0, deadP: 0.15, tint: 0x88aa90 }));
  // eyes in the dark
  const NE = 46, eyes = [], em = [];
  for (let i = 0; i < NE; i++) {
    const d = R(S1.d0 - 6, S2.d1 + 6), sd = (R(0, 1) < 0.5 ? -1 : 1) * R(3.8, 17), p = X.at(d, sd, 0), y = R(0.45, 1.6), gap = 0.2;
    const f = X.at(d, sd, 0), tg = X.frame(d), sx = -tg.tz, sz = tg.tx;
    eyes.push({ p, y, gap, sx, sz, ph: R(0, TAU), kill: X.sec.pre.t0 + 1 + R(0, 10) });
  }
  const eyeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffb030 }), NE * 2);
  eyeMesh.frustumCulled = false; g.add(eyeMesh);
  const dm = new THREE.Object3D();
  // one clearing where it all happens: Neeris turning, the pack, Arthas's blade, Lucien, and the blue dagger
  const L = X.line, dn = S1.d0 + S1.len * 0.55, yaw = X.yawAt(dn), at = (along, side) => X.at(dn + along, side, 0);
  const np = at(0, -4), ner = ch.neeris({ pose: 'Crouch_Idle_Loop' }); ner.position.copy(np); g.add(ner);
  const sp = at(3, 1.5);
  const slab = solid([bx(1.5, 0.5, 1.0, 0x6a6e76, [0, 0.25, 0])]); slab.position.copy(sp); slab.rotation.y = yaw; g.add(slab);
  const dag = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.0, 4), new THREE.MeshBasicMaterial({ color: 0xdff4ff })); blade.rotation.x = Math.PI; blade.scale.z = 0.3; blade.position.y = -0.1; dag.add(blade);
  dag.add(solid([bx(0.36, 0.05, 0.09, 0x8a8e98, [0, 0.42, 0]), cy(0.035, 0.035, 0.3, 5, 0x3a2a22, [0, 0.62, 0]), ic(0.06, 0, 0xa0a4ac, [0, 0.8, 0])]));
  const dg = X.glow(0x40c8ff, 3.2, 0.9); dg.position.y = 0.2; dag.add(dg); g.add(dag);
  const lu = ch.lucien({ pose: 'Spell_Simple_Idle_Loop' }); lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
  lu.position.copy(at(-3, 3.5)); g.add(lu);
  const art = ch.arthas({ pose: 'Sword_Idle' }); art.position.copy(at(-6, 1)); g.add(art);
  const ced = ch.cedric({ pose: 'Idle_Loop' }); ced.position.copy(at(-7, -1)); g.add(ced);
  X.anchors.neeris = ner; X.anchors.dagger = dag; X.anchors.lucienWood = lu; X.anchors.arthasWood = art; X.anchors.cedricWood = ced; X.anchors.clearing = new THREE.Object3D(); X.anchors.clearing.position.copy(at(0, 0)); g.add(X.anchors.clearing);
  // the barrier that stops Arthas's blade ("it would not land")
  const ward = X.glow(0x70c8ff, 3, 0); g.add(ward);
  const strike = L(5), stop = L(6), took = L(8), drove = L(9), calmT = L(11);
  const actors = [
    C.act(art, [
      { t: S1.t0, to: at(-4, -1), move: 3, face: ner, pose: 'Sword_Idle' },
      { t: strike, to: at(-1.3, -3.4), move: 0.7, face: ner, pose: 'Sprint_Loop' },             // "Arthas struck"
      { t: strike + 0.7, pose: 'Sword_Idle', face: ner },
      { t: L(7), to: at(-3, -2), move: 1.2, face: ner, pose: 'Sword_Idle' }
    ]),
    C.act(ced, [{ t: S1.t0, to: at(-6, 0), move: 3, face: ner }, { t: L(4), pose: 'Crouch_Idle_Loop', face: ner }, { t: drove + 2, pose: 'Idle_Loop', face: ner }]),
    C.act(lu, [
      { t: S1.t0, to: at(-2, 3), move: 3, face: ner, pose: 'Spell_Simple_Idle_Loop' },
      { t: L(7), pose: 'Idle_Loop', face: ner },                                                  // "I stood there, spellless"
      { t: took, pose: 'Idle_Loop', face: dag }
    ]),
    C.act(ner, [
      { t: 0, pose: 'Crouch_Idle_Loop', face: at(-3, 0) },
      { t: L(4), pose: 'Crouch_Idle_Loop', s: 1.12 },                                            // "Neeris turning, teeth and claw"
      { t: took - 1.2, to: sp.clone().add(new THREE.Vector3(0, 0, 0)).lerp(np, 0.35), move: 1.2, pose: 'Sprint_Loop', s: 1.12 },
      { t: took, pose: 'Idle_Loop', face: dag, s: 1.12 },                                        // "took my dagger for his own"
      { t: drove, pose: 'Fixing_Kneeling', s: 1.0 },                                              // "drove it in, and stopped the change"
      { t: calmT + 1, pose: 'Sitting_Idle_Loop', s: 1.0 }
    ])
  ];
  const wolves = [];
  for (let i = 0; i < 7; i++) {
    const w = C.creature('wolf', { h: 0.95, tint: i % 3 ? 0x6a6a72 : 0x3a3a40, clip: 'Gallop', ph: i * 0.37 });
    if (!w) break;
    w.userData.side = (i % 2 ? 1 : -1) * (3.5 + (i % 4) * 1.6); w.userData.lead = 3 + i * 2.3; g.add(w); X.anims.push(w); wolves.push(w);
  }
  if (wolves.length) X.anchors.wolf = wolves[0];
  const nerEyes = ner.userData.eyes;
  return {
    group: g, d0: S1.d0, d1: S2.d1, vis: 90,
    update(t, ctx) {
      for (let i = 0; i < NE; i++) {
        const e = eyes[i], alive = 1 - ss(drove + i * 0.1, drove + 2 + i * 0.1, t);
        const blink = Math.sin(ctx.time * 1.1 + e.ph) > 0.97 ? 0.1 : 1, s = alive * blink;
        for (let k = 0; k < 2; k++) {
          const o = (k ? 1 : -1) * e.gap;
          dm.position.set(e.p.x + e.sx * o, e.y, e.p.z + e.sz * o); dm.scale.set(s + 0.001, s * 0.8 + 0.001, s + 0.001); dm.updateMatrix(); eyeMesh.setMatrixAt(i * 2 + k, dm.matrix);
        }
      }
      eyeMesh.instanceMatrix.needsUpdate = true;
      actors.forEach((a) => a.update(t, ctx));
      // the pack: runs with the camera through the wood, then circles Neeris, snarling, until the dagger goes in
      const arrive = L(4, 1), dNow = X.distAt(Math.min(t, arrive));
      wolves.forEach((w, i) => {
        w.visible = t > S1.t0 - 2 && t < calmT + 4;
        if (!w.visible) return;
        if (t < arrive) {
          const d = dNow + w.userData.lead + Math.sin(ctx.time * 0.7 + i) * 0.6, p = X.at(d, w.userData.side, 0);
          w.position.copy(p); w.rotation.y = X.yawAt(d) + Math.PI; w.userData.pose('Gallop');
        } else {
          const a = i / wolves.length * TAU + (t < drove ? (t - arrive) * 0.5 : (drove - arrive) * 0.5), p = ner.position, r = t < drove ? 4.5 : 5.5;
          w.position.set(p.x + Math.cos(a) * r, 0, p.z + Math.sin(a) * r);
          if (t < drove) { w.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a)) + (i % 2 ? 0 : Math.PI); w.userData.pose(i % 3 ? 'Gallop' : 'Attack'); }
          else { w.lookAt(p.x, 0, p.z); w.userData.pose('Idle_2_HeadLow'); }
          w.scale.setScalar(1 - 0.999 * ss(calmT + 1, calmT + 4, t));  // the cursed pack fades with the curse
        }
      });
      if (nerEyes) nerEyes.material.color.setHex(t > L(4) && t < drove ? 0xff4010 : 0xffb030);
      // the ward that stops Arthas's blade
      const wp = new THREE.Vector3().lerpVectors(art.position, ner.position, 0.55); ward.position.set(wp.x, 1.3, wp.z);
      ward.material.opacity = 0.95 * ss(stop - 0.2, stop + 0.1, t) * (1 - ss(stop + 2.2, stop + 3.2, t));
      ward.scale.setScalar(3 + 2 * Math.sin(ctx.time * 9) * ward.material.opacity);
      if (lu.userData.spark) lu.userData.spark.material.opacity = t > L(7) && t < took ? (Math.sin(ctx.time * 23) > 0.6 ? 0.5 : 0) : 0.85;  // "spellless"
      // the dagger: hovers over the slab, flies to Neeris, goes in with a blue flash
      const rise = ss(S1.t0, S1.t0 + 3, t), fly = ss(took - 0.6, took + 0.3, t);
      const hand = new THREE.Vector3(ner.position.x, 1.1, ner.position.z);
      dag.position.set(lerp(sp.x, hand.x, fly), lerp(0.55 + 1.2 * rise + 0.08 * Math.sin(ctx.time * 1.4), hand.y, fly), lerp(sp.z, hand.z, fly));
      dag.rotation.set(fly * Math.PI * 0.9, ctx.time * 0.6 * (1 - fly), 0);
      const flash = t >= drove ? Math.exp(-(t - drove) * 1.8) : 0;
      dg.material.opacity = 0.55 + 0.35 * Math.sin(ctx.time * 3) * 0.5 + flash * 0.8; dg.scale.setScalar(3.2 + flash * 14);
      ctx.light(0, dag.position.x, 1.6, dag.position.z, 0x50c8ff, 0.6 + 1.8 * rise + flash * 7, 30);
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
