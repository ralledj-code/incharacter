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
  const fire = kit.fire({ scale: 1.5, size: 7 }); fire.group.position.set(fp.x, 0.1, fp.z); g.add(fire.group);
  const stones = [], logs = [];
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; stones.push(ic(0.3, 0, 0x5c6068, [Math.cos(a) * 1.1, 0.15, Math.sin(a) * 1.1], [1, 0.7, 1])); }
  for (let i = 0; i < 3; i++) logs.push(cy(0.12, 0.12, 1.4, 6, 0x3a2a1c, [0, 0.25, 0], [0.2, i * 1.05, Math.PI / 2]));
  const ring = solid(stones.concat(logs)); ring.position.set(fp.x, 0, fp.z); g.add(ring);
  // Neeris sits opposite, hands bound; Lucien's coat lies on the log nearest the path
  const ner = ch.neeris(); const np = X.at(dF, 8.6, 0); ner.position.copy(np); ner.scale.y = 0.72; ner.rotation.y = X.yawAt(dF) + Math.PI / 2; g.add(ner);
  const lu = ch.lucien(); const lp = X.at(dF + 0.5, 1.9, 0); lu.position.copy(lp); lu.rotation.y = X.yawAt(dF) - Math.PI / 2 - 0.4; lu.scale.y = 0.78; g.add(lu);
  // a loose chain on the ground
  const links = []; for (let i = 0; i < 14; i++) { const a = i * 0.5; links.push(M([fp.x + 2.2 + Math.cos(a) * (0.4 + i * 0.05), 0.06, fp.z + 1.2 + Math.sin(a) * (0.4 + i * 0.05)], [Math.PI / 2, i % 2 ? Math.PI / 2 : 0, a], [1.5, 1, 1])); }
  g.add(inst(kit.linkGeo, lamb({ color: 0xb8bcc8 }), links));
  return {
    group: g, d0: S.d0, d1: S.d1, vis: 100,
    update(t, ctx) {
      fire.update(ctx.time);
      ctx.light(1, fp.x, 1.4, fp.z, 0xff9a40, 2.8 * fire.flicker(ctx.time), 30);
      ner.rotation.x = 0.12 * Math.sin(ctx.time * 0.6);
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
  // Cedric and Arthas wait on the red road; Neeris is let go down the blue one
  [['cedric', -9.2], ['arthas', -10.6]].forEach((c, i) => {
    const f = ch[c[0]](), a = -0.6; f.position.set(Math.sin(a) * 9 + (i ? 1.5 : -0.5), 0, -Math.cos(a) * 9 - 2.5 * i); f.rotation.y = 0.9 - i * 0.2; rd.add(f);
  });
  const ner = ch.neeris(); rd.add(ner);
  return {
    group: g, d0: S.d0, d1: S.d1, vis: 100,
    update(t, ctx) {
      const letGo = ss(S.t0 + 11, S.t0 + 13, t), walk = ss(S.t0 + 13, S.t1 - 2, t);
      const redK = 1 - ss(S.t0 + 12.5, S.t0 + 14.5, t) + 0.001;
      redG.material.opacity = 0.9 * redK * (0.8 + 0.2 * Math.sin(ctx.time * 11)); blueG.material.opacity = 0.5 + 0.4 * letGo;
      const a = 0.6, s = 3 + walk * 38;
      if (walk > 0) { ner.position.set(Math.sin(a) * s, 0, -Math.cos(a) * s); ner.rotation.y = Math.PI + a; ner.scale.y = 1; }
      else { ner.position.set(1.4, 0, -2.2); ner.scale.y = 0.62; ner.rotation.y = 0.3; }
      const cr = X.at(ctx.camD + 8, 0, 0).clone();
      ctx.light(0, cp.x + Math.cos(yaw) * -6, 3, cp.z + Math.sin(yaw) * 2, 0xff4030, 1.9 * redK, 26);
      ctx.light(1, cp.x + Math.cos(yaw) * 6, 3, cp.z - Math.sin(yaw) * 2, 0x60c0ff, 0.8 + 1.5 * letGo, 26);
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
