(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, M, bx, cy, cn, ic, tri, part, solid, emis, inst, lamb, R } = C;
const SC = C.scenes.baphomet;
const Y = new THREE.Vector3(0, 1, 0);

function seg(a, b, rad, color) {
  const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), len = d.length();
  const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()), new THREE.Vector3(1, 1, 1));
  return part(new THREE.CylinderGeometry(rad, rad * 0.8, len, 5), color, m);
}

/* The black wyrm. pose 'fly' keeps the neck raised; 'dead' lays it on the ground with the jaw open. */
C.buildDragon = function (pose) {
  const dead = pose === 'dead', g = new THREE.Group(), sc = 0x1c1618, belly = 0x3a2626, mem = 0x2e1a1e;
  const P = [ic(1, 1, sc, [0, 0, 0], [1.15, 1.0, 2.6])];
  for (let i = 0; i < 8; i++) P.push(cn(0.16, 0.5, 4, 0x2a2224, [0, 0.95 - Math.abs(i - 3.5) * 0.05, -1.6 + i * 0.5]));
  [[-0.9, -1.0], [0.9, -1.0], [-0.9, 1.1], [0.9, 1.1]].forEach((l) => {
    if (dead) P.push(seg([l[0] * 0.6, -0.4, l[1]], [l[0] * 1.9, -0.9, l[1] - 0.3], 0.26, sc)); else P.push(seg([l[0] * 0.6, -0.5, l[1]], [l[0] * 0.9, -1.5, l[1] + 0.2], 0.22, sc));
  });
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < 4; i++) {
    nx = dead ? 0.35 * i : 0; ny = dead ? -0.1 + 0.02 * i : 0.3 + 0.55 * i; nz = -2.5 - 0.85 * i;
    P.push(ic(0.7 - 0.08 * i, 1, sc, [nx, ny, nz], [1, 1, 1.2]));
  }
  const hx = nx + (dead ? 0.3 : 0), hy = ny + (dead ? -0.15 : 0.3), hz = nz - 1.1;
  P.push(bx(0.8, 0.6, 1.1, sc, [hx, hy, hz]), bx(0.55, 0.4, 0.95, sc, [hx, hy - 0.05, hz - 0.95]),
    bx(0.5, 0.18, 0.85, belly, [hx, hy - 0.4 - (dead ? 0.15 : 0), hz - 0.85], [dead ? 0.3 : 0, 0, 0]),
    cn(0.12, 0.8, 4, 0x2a2224, [hx - 0.3, hy + 0.45, hz + 0.3], [1.0, 0, 0.3]), cn(0.12, 0.8, 4, 0x2a2224, [hx + 0.3, hy + 0.45, hz + 0.3], [1.0, 0, -0.3]));
  for (let i = 0; i < 5; i++) P.push(cn(0.04, 0.16, 3, 0xd8d0c0, [hx + (i - 2) * 0.1, hy - 0.22, hz - 1.35], [Math.PI, 0, 0]));
  for (let k = 0; k < 7; k++) P.push(cy(0.55 - 0.07 * k, 0.65 - 0.07 * k, 1.0, 6, sc, [Math.sin(k * 0.7) * (dead ? 0.9 : 0.5), dead ? -0.2 : 0.1 - 0.05 * k, 2.6 + k * 0.95], [Math.PI / 2, 0, 0]));
  g.add(solid(P));
  const mkWing = (sg) => {
    const w = new THREE.Group(), tip = [[sg * 4.2, -0.4, 2.2], [sg * 2.6, -0.5, 3.4], [sg * 0.6, -0.3, 2.8]], wr = [sg * 3.2, 0.2, -0.2];
    const WP = [seg([0, 0, 0], wr, 0.11, sc)];
    tip.forEach((t) => WP.push(seg(wr, t, 0.06, sc)));
    WP.push(tri([0, 0, 0], wr, tip[0], mem), tri([0, 0, 0], tip[0], tip[1], mem), tri([0, 0, 0], tip[1], tip[2], mem));
    w.add(solid(WP, { side: THREE.DoubleSide })); w.position.set(sg * 0.8, 0.8, -0.7); return w;
  };
  const wR = mkWing(1), wL = mkWing(-1);
  if (dead) { wR.rotation.z = -1.15; wL.rotation.z = 1.15; wR.position.y = 0.4; wL.position.y = 0.4; }
  g.add(wR); g.add(wL);
  const eyes = [-0.28, 0.28].map((x) => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.06), new THREE.MeshBasicMaterial({ color: dead ? 0x201010 : 0xffc030 }));
    e.position.set(hx + x, hy + 0.12, hz - 0.5); g.add(e); return e;
  });
  g.userData = { wR, wL, head: new THREE.Vector3(hx, hy, hz), eyes };
  return g;
};

/* ---- chorus: the brothers' avenue (used twice) ---- */
function brothers(secId, opt) {
  return function (X) {
    const S = X.sec[secId], kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
    g.add(kit.trees(S.d0 - 15, S.d1 + 15, { minSide: 12, maxSide: 44, dens: 0.9, deadP: opt.deadP, tint: opt.tint, under: false }));  // the avenue is a road: no undergrowth in the shots
    const list = [];
    for (let d = S.d0 + 2; d < S.d1 - 2; d += 6) { const a = X.at(d, -5.5, 0), b = X.at(d + 3, 5.5, 0); list.push({ x: a.x, z: a.z }, { x: b.x, z: b.z }); }
    const tor = kit.torches(list, { glow: 0xffb060, size: 3.0, op: 0.75 }); g.add(tor.group);
    const banners = [];
    [['cedric', 0.22, -8], ['arthas', 0.5, 8], ['lucien', 0.78, -8]].forEach((b) => {
      const d = S.d0 + S.len * b[1], p = X.at(d, b[2], 0), grp = new THREE.Group();
      grp.add(solid([cy(0.08, 0.1, 9, 6, 0x3a2818, [0, 4.5, 0]), bx(3.2, 0.12, 0.12, 0x2a1c12, [0, 8.6, 0]), ic(0.18, 0, 0xc9a24a, [0, 9.1, 0])]));
      const geo = new THREE.PlaneGeometry(2.6, 4.6, 8, 14), cloth = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: C.bannerTexture(b[0]), side: THREE.DoubleSide }));
      cloth.position.set(0, 6.2, 0.06); grp.add(cloth);
      grp.position.copy(p); kit.placeFacing(grp, d, b[2]); g.add(grp);
      banners.push({ geo, base: geo.attributes.position.array.slice(), ph: R(0, TAU) });
    });
    // the three walk down the avenue toward the camera; they stop for the name lines, each steps forward on his,
    // stand together on "by fire, by fang", then walk on (actors: facing follows their steps, no sliding)
    const L = X.line, k0 = opt.line0;
    const dStop = S.d0 + 16, dA = dStop + 5.5, dEnd = Math.max(S.d0 + 4, dStop - 9);  // close to where the camera enters the avenue, at a walking pace
    const road = (d0, d1, sd) => { const pts = [], st = d1 < d0 ? -3 : 3; for (let d = d0; st < 0 ? d > d1 : d < d1; d += st) pts.push(X.at(d, sd, 0)); pts.push(X.at(d1, sd, 0)); return pts; };  // always ends exactly at d1
    const who = [['cedric', -1.4, k0 + 1, 'Idle_Torch_Loop'], ['lucien', 0, k0 + 2, 'Spell_Simple_Idle_Loop'], ['arthas', 1.4, k0 + 3, 'Sword_Idle']];
    const toCam = X.at(dStop - 30, 0, 0);
    const party = who.map(([k, sd, line, pose]) => {
      const f = ch[k]({ pose: 'Idle_Loop' }); if (k === 'lucien') f.userData.blade.visible = true;
      f.position.copy(X.at(dA, sd, 0)); g.add(f);
      const act = C.act(f, [
        { t: 0, face: toCam },
        { t: S.t0 - 1, to: road(dA, dStop, sd), by: L(k0 + 1, -0.4) },                                    // "sing of the brothers"
        { t: L(k0 + 1, -0.4), pose: 'Idle_Loop', face: toCam },
        { t: L(line, -0.4), to: X.at(dStop - 1.6, sd * 0.4, 0), move: 0.9 },                               // his name: one step forward
        { t: L(line, 0.5), pose, face: toCam },
        { t: L(line, 3.2), to: X.at(dStop, sd, 0), move: 1.1, back: true },                                 // and back into line
        { t: L(line, 4.3), pose: 'Idle_Loop', face: toCam },
        { t: L(k0 + 4, -0.2), pose: 'Sword_Idle', face: toCam },                                            // "by fire, by fang"
        { t: L(k0 + 5, -0.2), to: road(dStop, dEnd, sd), by: S.t1 }                                         // "we walked the road"
      ]);
      return { f, act, pose };
    });
    X.anchors['party_' + secId] = party[1].f; X.anchors['cedric_' + secId] = party[0].f; X.anchors['arthas_' + secId] = party[2].f;
    const upd = (t, ctx) => {
      party.forEach((p) => {
        p.act.update(t, ctx);
        const sp = p.f.userData.spark, on = p.pose === 'Spell_Simple_Idle_Loop' && t > L(k0 + 2, 0.5) && t < L(k0 + 2, 3.2);
        if (sp) { if (!sp.userData.base) sp.userData.base = sp.scale.x; sp.scale.setScalar(sp.userData.base * (on ? 3.5 + Math.sin(t * 20) : 1)); }
      });
    };
    return {
      group: g, d0: S.d0, d1: S.d1, vis: 100,
      update(t, ctx) {
        tor.update(ctx.time); upd(t, ctx);
        banners.forEach((b) => {
          const a = b.geo.attributes.position, arr = a.array;
          for (let i = 0; i < arr.length; i += 3) {
            const x = b.base[i], y = b.base[i + 1], k = (2.3 - y) / 4.6;
            arr[i + 2] = Math.sin(x * 2.0 + k * 3.0 - ctx.time * 3 + b.ph) * (0.04 + 0.2 * k);
          }
          a.needsUpdate = true; b.geo.computeVertexNormals();
        });
        const p = party[1].f.position;
        ctx.light(opt.slot, p.x, 4, p.z, opt.light, 1.8 + 0.3 * Math.sin(ctx.time * 6), 34);
      }
    };
  };
}
SC.push(brothers('chorus', { deadP: 0.1, tint: 0xa8a0c8, slot: 0, light: 0xffb868, line0: 12 }));
SC.push(brothers('chorus2', { deadP: 0.05, tint: 0xd0b0b8, slot: 1, light: 0xffc080, line0: 40 }));

/* ---- the wyrm in the red sky, and the scorched land ---- */
SC.push(function (X) {
  const S = X.sec.v2, S2 = X.sec.v2b, Sb = X.sec.brk, kit = C.kit(X), g = new THREE.Group();
  g.add(kit.trees(S.d0 - 15, Sb.d0 + 40, { minSide: 7, maxSide: 40, dens: 1.0, deadP: 0.9, tint: 0xc09080 }));
  const NC = 70, cm = [];
  for (let i = 0; i < NC; i++) { const p = X.at(R(S.d0 - 10, Sb.d0 + 40), R(-22, 22), 0); cm.push(M([p.x, 0.03, p.z], [-Math.PI / 2, 0, R(0, TAU)], [R(1.4, 3.6), R(0.15, 0.4), 1])); }
  const cracks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xff5a18, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }), NC);
  cm.forEach((m, i) => cracks.setMatrixAt(i, m)); cracks.frustumCulled = false; g.add(cracks);
  const flyer = C.creature('wyrm', { h: 7, tint: 0x3a3236, clip: 'Flying' });  // the black wyrm (CC0 low-poly dragon, OpenGameArt)
  if (flyer) [0.09, -0.09].forEach((x) => { const e = X.glow(0xff6a20, 1.2, 0.95); C.attach(flyer, 'head', e, [x, 0.12, 0.6]); });
  const dragon = flyer || C.buildDragon('fly'); if (!flyer) dragon.scale.setScalar(2.2); else X.anims.push(flyer);
  g.add(dragon); X.anchors.wyrm = dragon;
  const jet = []; for (let i = 0; i < 7; i++) { const s = X.glow(0xff7a20, 3, 0); g.add(s); jet.push(s); }
  // the brothers stand on the scorched land and fight it; Cedric then runs after it
  const L = X.line, ch = C.chars(X), dF = S.d0 + S.len * 0.45, F = X.at(dF, 0, 0), yF = X.yawAt(dF);
  const pos = (along, side, h) => X.at(dF + along, side, h || 0);
  const art = ch.arthas({ pose: 'Sword_Idle' }), luc = ch.lucien({ pose: 'Idle_Loop' }), ced = ch.cedric({ pose: 'Idle_Loop' });
  art.position.copy(pos(0, -1.6)); luc.position.copy(pos(-1, 1.4)); ced.position.copy(pos(1, 0.2)); [art, luc, ced].forEach((o) => g.add(o));
  X.anchors.arthasWyrm = art; X.anchors.lucienWyrm = luc; X.anchors.cedricWyrm = ced; X.anchors.fight = new THREE.Object3D(); X.anchors.fight.position.copy(F); g.add(X.anchors.fight);
  const rose = L(18), struck = L(19), gold = L(20), ran = L(21);
  const actors = [
    C.act(art, [{ t: 0, face: pos(40, 0), pose: 'Sword_Idle' }, { t: struck + 0.5, to: pos(2.5, -1.2), move: 1.0 }, { t: struck + 1.4, pose: 'Sword_Idle', face: pos(40, 0) }, { t: gold, pose: 'Idle_Talking_Loop', face: luc }]),
    C.act(luc, [{ t: 0, face: pos(40, 0), pose: 'Idle_Loop' }, { t: rose + 1, pose: 'Spell_Simple_Idle_Loop' }, { t: gold, pose: 'Idle_Loop', face: art }]),
    C.act(ced, [{ t: 0, face: pos(40, 0), pose: 'Idle_Loop' }, { t: struck, pose: 'Crouch_Idle_Loop' }, { t: ran, to: pos(26, 1), move: 5.5 }, { t: ran + 5.5, show: false }])
  ];
  const bolt = X.glow(0xb070ff, 2.2, 0); g.add(bolt);
  // the wyrm's flight as keyframes on song time (rise from the horizon, dive at the brothers, flee), then waiting in the crater
  const dCr = Sb.d0 + 16, lair = X.at(dCr + 13, -19, 0);
  const KF = [
    [rose - 3, pos(90, 25, -14)], [rose + 3.5, pos(55, 8, 24)], [struck - 0.2, pos(22, 3, 14)], [struck + 1.2, pos(0, 0, 5)],
    [struck + 2.6, pos(-25, -10, 12)], [gold + 2, pos(-10, -70, 45)], [ran + 1, pos(60, -60, 40)],
    [S2.t0 + 1, X.at(dCr + 40, -30, 20)], [S2.t0 + 6, lair.clone().setY(1.2)]
  ];
  const where = (t, out) => {
    if (t <= KF[0][0]) return out.copy(KF[0][1]);
    for (let k = 0; k < KF.length - 1; k++) if (t < KF[k + 1][0]) { const u = (t - KF[k][0]) / (KF[k + 1][0] - KF[k][0]); return out.lerpVectors(KF[k][1], KF[k + 1][1], sm(u)); }
    return out.copy(KF[KF.length - 1][1]);
  };
  // the flight as a flying actor: heading, climb and bank come from the path itself
  if (flyer) {
    flyer.position.copy(KF[0][1]);
    const beats = [{ t: 0, show: false }, { t: KF[0][0], show: true }];
    for (let k = 1; k < KF.length; k++) beats.push({ t: KF[k - 1][0], to: KF[k][1], by: KF[k][0] });
    beats.push({ t: KF[KF.length - 1][0], face: X.at(dCr, 0, 0) });
    C.act(flyer, beats, { fly: true, gait: [['Flying', 1]], stance: { clip: 'Flying', at: 0.55 }, idle: 'Flying' });
  }
  const P0 = new THREE.Vector3(), P1 = new THREE.Vector3();
  return {
    group: g, d0: S.d0 - 10, d1: Sb.d0, t0: S.t0 - 3, t1: Sb.t0 + 0.05,
    update(t, ctx) {
      actors.forEach((a) => a.update(t, ctx));
      const landed = t > S2.t0 + 6;
      dragon.visible = t > rose - 3 && t < Sb.t0;
      if (dragon.visible) {
        if (flyer) flyer.userData.actor.update(t, ctx);
        else { where(t, P0); dragon.position.copy(P0); }
        const fw = new THREE.Vector3(0, 0, 1).applyEuler(dragon.rotation), mouth = dragon.position.clone().addScaledVector(fw, 4.2).add(new THREE.Vector3(0, 1.2, 0));
        const br = ss(struck - 1, struck - 0.4, t) * (1 - ss(struck + 1, struck + 1.6, t));  // fire on the dive
        jet.forEach((s, i) => { s.position.copy(mouth).addScaledVector(fw, 2.5 + i * 3.2).y -= i * 0.6; s.scale.setScalar(2 + i * 1.2); s.material.opacity = br * (0.8 - i * 0.08); });
        ctx.light(1, dragon.position.x, dragon.position.y - 4, dragon.position.z, 0xff7a30, 2.0 * br + 1.4, 70);
      } else jet.forEach((s) => { s.material.opacity = 0; });
      // Lucien's bolt on "we struck it down"
      const bu = ss(struck + 0.4, struck + 1.1, t), lh = luc.position.clone().setY(1.5);
      bolt.position.lerpVectors(lh, dragon.position, bu); bolt.material.opacity = t > struck + 0.4 && t < struck + 1.3 ? 0.95 : 0; bolt.scale.setScalar(2 + bu * 3);
      cracks.material.opacity = 0.55 + 0.25 * Math.sin(ctx.time * 2.3);
    }
  };
});

/* ---- Cedric alone, the crater, and the kill ---- */
SC.push(function (X) {
  const S = X.sec.v2b, Sb = X.sec.brk, Sc = X.sec.v2c, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
  const TK = Sb.t0, dCr = Sb.d0 + 16;
  // bone arches around the crater
  const arches = [], tg = new THREE.TorusGeometry(2.6, 0.2, 5, 9, Math.PI); tg.rotateX(0);
  for (let i = 0; i < 14; i++) { const d = R(S.d0, dCr + 30), sd = (R(0, 1) < 0.5 ? -1 : 1) * R(6, 24), p = X.at(d, sd, 0); arches.push(M([p.x, 0, p.z], [0, R(0, TAU), 0], R(0.8, 1.8))); }
  g.add(inst(C.merge([part(tg, 0xcfc6b0)]), lamb({ color: 0xffffff }), arches));
  // the carcass
  const SCL = 2.3, bodyD = dCr + 13, corpse = C.creature('wyrm', { h: 7, tint: 0x3a3236, clip: 'Flying' });
  const dragon = corpse || C.buildDragon('dead');
  const bp = X.at(bodyD, corpse ? -19 : -8.5, corpse ? 0 : 1.1 * SCL * 0.9); dragon.position.copy(bp); if (!corpse) dragon.scale.setScalar(SCL); dragon.rotation.y = X.yawAt(bodyD) + Math.PI; dragon.visible = false; g.add(dragon);
  dragon.updateMatrixWorld(true);
  let headW;
  if (corpse) {
    // no death clip: freeze a wings-folded frame, roll the body onto its side and settle it on the ground
    corpse.userData.timeFn = () => 0.55; X.anims.push(corpse); corpse.userData.mixer.setTime(0.55);
    corpse.rotation.z = 1.35; corpse.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(corpse); corpse.position.y -= bb.min.y - 0.1; corpse.updateMatrixWorld(true);
    headW = corpse.userData.bones.head ? corpse.userData.bones.head.getWorldPosition(new THREE.Vector3()) : X.at(bodyD - 3, -13, 2.2);
    const top = new THREE.Box3().setFromObject(corpse); headW = new THREE.Vector3((top.min.x + top.max.x) / 2, top.max.y - 0.3, (top.min.z + top.max.z) / 2);  // Cedric stands on the highest point
  } else headW = dragon.localToWorld(dragon.userData.head.clone());
  X.anchors.carcass = dragon;
  // bats over the crater while Cedric hunts
  const bats = [];
  for (let i = 0; i < 9; i++) { const b = C.creature('bat', { h: 0.7, tint: 0x4a3a40, clip: 'Bat_Flying', ph: i * 0.21 }); if (!b) break; b.userData.flyer = true; g.add(b); X.anims.push(b); bats.push(b); }
  const eyeG = [X.glow(0xff2a1a, 3.2, 0), X.glow(0xff2a1a, 3.2, 0)]; eyeG[0].position.copy(headW).add(new THREE.Vector3(0.6, 1.2, 0)); eyeG[1].position.copy(headW).add(new THREE.Vector3(-0.6, 1.2, 0)); eyeG.forEach((e) => g.add(e));
  // Cedric: runs ahead, then stands on the dragon's head
  const ced = ch.cedric({ pose: 'Sprint_Loop' }); g.add(ced); X.anchors.cedricHunt = ced;
  const huntPath = []; for (let d = X.distAt(S.t0) + 32; d < dCr - 3; d += 3) huntPath.push(X.at(d, 1.2, 0));
  ced.position.copy(huntPath[0] || X.at(dCr - 3, 1.2, 0));
  let cedAct = null;
  // Cedric: sprints after it along the path, leaps onto it on "HE KILLED IT", stands on the carcass
  const top = new THREE.Vector3(headW.x, corpse ? headW.y : headW.y + 0.55 * SCL * 0.5, headW.z);
  cedAct = C.act(ced, [
    { t: 0, show: false }, { t: S.t0 - 0.5, show: true, to: huntPath, by: TK - 1.4 },
    { t: TK - 1.4, to: top, move: 1.4, air: true, y: (u) => Math.sin(u * Math.PI) * 4, pose: 'Jog_Fwd_Loop' },
    { t: TK, pose: 'Idle_Torch_Loop', face: X.at(dCr + 30, 0, 0) }
  ]);
  return {
    group: g, d0: S.d0, d1: Sc.d1, vis: 110,
    update(t, ctx) {
      const killed = t >= TK;
      bats.forEach((b, i) => {
        b.visible = t > S.t0 && t < TK + 3; if (!b.visible) return;
        const a = ctx.time * (0.5 + i * 0.05) + i * 0.7, c = X.at(dCr - 6, 0, 0), r = 6 + (i % 3) * 3, flee = ss(TK, TK + 3, t);
        b.position.set(c.x + Math.cos(a) * r * (1 + flee * 4), 4 + (i % 4) * 1.4 + Math.sin(ctx.time * 2 + i) * 0.6 + flee * 12, c.z + Math.sin(a) * r * (1 + flee * 4));
        b.rotation.y = -a;
      });
      dragon.visible = killed;
      if (killed && !corpse) dragon.scale.setScalar(SCL * (0.92 + 0.08 * sm((t - TK) / 0.4)));
      const glowK = killed ? 0 : ss(X.sec.v2b.t0, X.sec.brk.t0 - 1, t) * (0.8 + 0.2 * Math.sin(ctx.time * 5));
      eyeG.forEach((e) => { e.material.opacity = glowK; });
      cedAct.update(t, ctx);
      if (!killed) {
        ctx.light(0, headW.x, 1.6, headW.z, 0xff3a22, 0.8 * glowK, 30);
      } else {
        const k = Math.exp(-(t - TK) * 1.5);
        ctx.light(0, headW.x, 3.0, headW.z, 0xffd890, 2.2 + 8 * k, 42);
      }
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
