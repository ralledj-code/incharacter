(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, M, bx, cy, cn, ic, part, solid, emis, inst, lamb, R } = C;
const SC = C.scenes.baphomet;

/* ---- the campfire: Lucien and the tamed traitor ---- */
SC.push(function (X) {
  const S = X.sec.v3, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
  g.add(kit.trees(S.d0 - 14, S.d1 + 14, { minSide: 9, maxSide: 36, dens: 1.2, deadP: 0.3, tint: 0x7a8a9a }));
  const dF = S.d0 + S.len * 0.5, fp = X.at(dF, 4.6, 0);
  const fire = kit.fire({ scale: 1.5, size: 7 }); fire.group.position.set(fp.x, 0.1, fp.z); g.add(fire.group); X.anchors.campfire = fire.group;
  const stones = [], logs = [];
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; stones.push(ic(0.3, 0, 0x5c6068, [Math.cos(a) * 1.1, 0.15, Math.sin(a) * 1.1], [1, 0.7, 1])); }
  for (let i = 0; i < 3; i++) logs.push(cy(0.12, 0.12, 1.4, 6, 0x3a2a1c, [0, 0.25, 0], [0.2, i * 1.05, Math.PI / 2]));
  const ring = solid(stones.concat(logs)); ring.position.set(fp.x, 0, fp.z); g.add(ring);
  // Neeris sits opposite, hands bound; Lucien's coat lies on the log nearest the path
  const ner = ch.neeris({ pose: 'Sitting_Idle_Loop' }); const np = X.at(dF, 8.6, 0); ner.position.copy(np); if (!ner.userData.mixer) ner.scale.y = 0.72; ner.rotation.y = X.yawAt(dF) + Math.PI / 2; g.add(ner);
  const lu = ch.lucien({ pose: 'Sitting_Idle_Loop' }); const lp = X.at(dF + 0.5, 1.9, 0); lu.position.copy(lp); lu.rotation.y = X.yawAt(dF) - Math.PI / 2 - 0.4; if (!lu.userData.mixer) lu.scale.y = 0.78; g.add(lu); X.anchors.lucienCamp = lu;
  // Arthas leaves for Cedric; Lucien is left with the bound druid
  const L = X.line, fpos = new THREE.Vector3(fp.x, 0, fp.z);
  const art = ch.arthas({ pose: 'Idle_Loop' }); art.position.copy(X.at(dF - 2, 2.4, 0)); g.add(art); X.anchors.arthasCamp = art;
  lu.position.copy(X.at(dF - 0.6, 2.2, 0)); ner.position.copy(X.at(dF + 0.4, 7.0, 0));
  const actors = [
    C.act(art, [{ t: 0, face: fpos }, { t: L(31), to: [X.at(dF - 1, 0.2, 0), X.at(dF + 24, 0, 0)], move: 6 }, { t: L(31, 6), show: false }]),   // away from the fire, past Lucien's back   // "Arthas ran off to find Cedric's side"
    C.act(lu, [{ t: 0, pose: 'Sitting_Idle_Loop', face: fpos },
      { t: L(33), to: X.at(dF + 2.4, 4.2, 0), move: 2.2, face: ner },                                       // "what do I do with a traitor turned tame?"
      { t: L(33, 2.2), pose: 'Idle_Talking_Loop', face: ner },
      { t: L(34), pose: 'Crouch_Idle_Loop', face: ner }]),                                                  // "the chains aren't the only thing that changed"
    C.act(ner, [{ t: 0, pose: 'Sitting_Idle_Loop', face: fpos }, { t: L(34, 1.5), pose: 'Sitting_Idle_Loop', face: lu }])
  ];
  X.anchors.neerisCamp = ner;
  // a loose chain on the ground
  const cpz = X.at(dF + 2.6, 6.2, 0), links = []; for (let i = 0; i < 14; i++) { const a = i * 0.5; links.push(M([cpz.x + Math.cos(a) * (0.4 + i * 0.05), 0.06, cpz.z + Math.sin(a) * (0.4 + i * 0.05)], [Math.PI / 2, i % 2 ? Math.PI / 2 : 0, a], [1.5, 1, 1])); }
  g.add(inst(kit.linkGeo, lamb({ color: 0xb8bcc8 }), links));
  return {
    group: g, d0: S.d0, d1: S.d1, vis: 100,
    update(t, ctx) {
      fire.update(ctx.time); actors.forEach((x) => x.update(t, ctx));
      ctx.light(1, fp.x, 1.4, fp.z, 0xff9a40, 2.8 * fire.flicker(ctx.time), 30);
      if (!ner.userData.mixer) ner.rotation.x = 0.12 * Math.sin(ctx.time * 0.6);
    }
  };
});

/* ---- the crossroads: the choice ---- */
SC.push(function (X) {
  const S = X.sec.pre2, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
  g.add(kit.trees(S.d0 - 14, S.d1 + 14, { minSide: 10, maxSide: 38, dens: 0.9, deadP: 0.35, tint: 0x8a8aa0 }));
  const dx = S.d0 + S.len * 0.4, cp = X.at(dx, 0, 0), yaw = X.yawAt(dx);
  const rd = new THREE.Group(); rd.position.set(cp.x, 0, cp.z); rd.rotation.y = yaw; g.add(rd);
  [-0.6, 0.6].forEach((a) => {
    const holder = new THREE.Group(); holder.rotation.y = a;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 46), new THREE.MeshLambertMaterial({ color: 0x2e2e38 })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.02, -23); holder.add(m);
    rd.add(holder);
  });
  // signpost on the left verge at the fork (the rail runs straight through the middle)
  const post = solid([cy(0.07, 0.09, 2.6, 5, 0x3a2a1c, [0, 1.3, 0]), bx(1.3, 0.22, 0.05, 0x5a4332, [-0.5, 2.2, 0], [0, 0, 0.12]), bx(1.3, 0.22, 0.05, 0x5a4332, [0.5, 1.8, 0], [0, 0, -0.12])]);
  post.position.set(-3.4, 0, -0.8); post.rotation.y = 0.35; rd.add(post);
  const lant = (x, z, colr) => {
    const grp = new THREE.Group(); grp.position.set(x, 0, z);
    grp.add(solid([cy(0.05, 0.06, 2.6, 5, 0x2a2a30, [0, 1.3, 0])]));
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), new THREE.MeshBasicMaterial({ color: colr })); b.position.y = 2.7; grp.add(b);
    const gl = X.glow(colr, 4, 0.9); gl.position.y = 2.7; grp.add(gl); rd.add(grp); return gl;
  };
  const redG = lant(-Math.sin(0.6) * 11 - 1.6, -Math.cos(0.6) * 11, 0xff3a2a), blueG = lant(Math.sin(0.6) * 11 + 1.6, -Math.cos(0.6) * 11, 0x50b8ff);
  // the choice, on the lines (positions in the fork's local frame: -z is ahead, the red road left, the blue road right)
  const L = X.line, V = (x, z) => new THREE.Vector3(x, 0, z), blue = (k) => V(Math.sin(0.6) * k, -Math.cos(0.6) * k), red = (k) => V(-Math.sin(0.6) * k, -Math.cos(0.6) * k);
  const lu = ch.lucien({ pose: 'Idle_Loop' }), ner = ch.neeris({ pose: 'Fixing_Kneeling' }), ced = ch.cedric({ pose: 'Idle_Loop' }), art = ch.arthas({ pose: 'Sword_Idle' });
  lu.position.copy(V(0, -1)); ner.position.copy(V(0.6, -3.4)); ced.position.copy(red(9)); art.position.copy(red(10.5).add(V(1.2, 0)));
  [lu, ner, ced, art].forEach((o) => rd.add(o));
  lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
  X.anchors.crossroads = rd; X.anchors.neerisCross = ner; X.anchors.lucienCross = lu; X.anchors.cedricCross = ced; X.anchors.arthasCross = art;
  const letT = L(38), trackT = L(39);
  const actors = [
    C.act(ner, [{ t: 0, pose: 'Fixing_Kneeling', face: V(0, -1) },                                 // "Neeris begs mercy"
      { t: letT + 0.5, pose: 'Idle_Loop', face: V(0, -1) },
      { t: letT + 1.6, to: blue(12), move: 5 },                                                        // "I let him go instead"
      { t: trackT, pose: 'Idle_Loop', face: V(0, -1) },                                                // "track the last moonwell"
      { t: trackT + 3.5, to: blue(42), move: 12 }]),
    C.act(lu, [{ t: 0, pose: 'Idle_Loop', face: V(0.6, -3.4) },
      { t: L(36), pose: 'Idle_Talking_Loop', face: V(0, 4) },                                          // "kick the feelings aside, now what will you do?"
      { t: L(37, 1.5), pose: 'Spell_Simple_Idle_Loop', face: V(-2.5, -2) },                            // holds the brothers back
      { t: trackT, pose: 'Spell_Simple_Idle_Loop', face: () => rd.localToWorld(ner.position.clone()).sub(rd.position).applyAxisAngle(new THREE.Vector3(0, 1, 0), -rd.rotation.y) }]),
    C.act(ced, [{ t: 0, face: V(0, -2) }, { t: L(37), to: V(-3.2, -1.8), move: 2.4 }, { t: L(37, 2.4), pose: 'Idle_Loop', face: V(0.6, -3.4) }]),   // "Cedric and Arthas want justice"
    C.act(art, [{ t: 0, face: V(0, -2), pose: 'Sword_Idle' }, { t: L(37), to: V(-2.2, -3.4), move: 2.4 }, { t: L(37, 2.4), pose: 'Sword_Idle', face: V(0.6, -3.4) }])
  ];
  return {
    group: g, d0: S.d0, d1: S.d1, vis: 100,
    update(t, ctx) {
      actors.forEach((x) => x.update(t, ctx));
      const letGo = ss(letT, letT + 2, t);
      const redK = 1 - ss(letT + 1.5, letT + 3.5, t) + 0.001;
      redG.material.opacity = 0.9 * redK * (0.8 + 0.2 * Math.sin(ctx.time * 11)); blueG.material.opacity = 0.5 + 0.4 * letGo;
      const cr = X.at(ctx.camD + 8, 0, 0).clone();
      ctx.light(0, cp.x + Math.cos(yaw) * -6, 3, cp.z + Math.sin(yaw) * 2, 0xff4030, 1.9 * redK, 26);
      ctx.light(1, cp.x + Math.cos(yaw) * 6, 3, cp.z - Math.sin(yaw) * 2, 0x60c0ff, 0.8 + 1.5 * letGo, 26);
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
