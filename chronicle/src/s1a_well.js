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
  return { group: g, d0: S.d0, d1: S.d1, vis: 110, update(t, ctx) { tor.update(ctx.time); } };
});

/* ---- 2. the moonwell: blood, chains, Baphomet ---- */
SC.push(function (X) {
  const S = X.sec.v1, kit = C.kit(X), g = new THREE.Group();
  const TB = S.t0 + 6.5;            // chains break
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
      bap.visible = tau > 0.4; bap.position.y = -8 + 8 * sm((tau - 0.8) / 6.5);
      const flash = tau > 0 ? Math.exp(-tau * 2.2) * 6 : 0;
      ctx.light(1, wp.x, 1.8, wp.z, disc.material.color, 2.6 + flash + 0.3 * Math.sin(ctx.time * 4), 34);
      const on = (t > S.t0 + 0.8 && t < TB) ? 1 : 0; drips.visible = on > 0;
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
  // Neeris crouched by the path
  const dn = S1.d0 + S1.len * 0.45, np = X.at(dn, -3.4, 0), ner = ch.neeris(); ner.position.copy(np); ner.rotation.y = X.yawAt(dn) + Math.PI / 2; g.add(ner);
  // the slab with the floating dagger, and Lucien watching
  const dd = S2.d0 + S2.len * 0.55, sp = X.at(dd, 3.0, 0);
  const slab = solid([bx(1.5, 0.5, 1.0, 0x6a6e76, [0, 0.25, 0])]); slab.position.copy(sp); slab.rotation.y = X.yawAt(dd); g.add(slab);
  const dag = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.0, 4), new THREE.MeshBasicMaterial({ color: 0xdff4ff })); blade.rotation.x = Math.PI; blade.scale.z = 0.3; blade.position.y = -0.1; dag.add(blade);
  dag.add(solid([bx(0.36, 0.05, 0.09, 0x8a8e98, [0, 0.42, 0]), cy(0.035, 0.035, 0.3, 5, 0x3a2a22, [0, 0.62, 0]), ic(0.06, 0, 0xa0a4ac, [0, 0.8, 0])]));
  const dg = X.glow(0x40c8ff, 3.2, 0.9); dg.position.y = 0.2; dag.add(dg); dag.position.copy(sp); g.add(dag);
  const lu = ch.lucien(); lu.userData.blade.visible = false; lu.userData.bladeGlow.visible = false;
  const lp = X.at(dd - 1.0, 5.0, 0); lu.position.copy(lp); lu.rotation.y = X.yawAt(dd) - Math.PI / 2 + 0.5; g.add(lu);
  return {
    group: g, d0: S1.d0, d1: S2.d1, vis: 90,
    update(t, ctx) {
      for (let i = 0; i < NE; i++) {
        const e = eyes[i], alive = 1 - ss(e.kill, e.kill + 2.5, t);
        const blink = Math.sin(ctx.time * 1.1 + e.ph) > 0.97 ? 0.1 : 1, s = alive * blink;
        for (let k = 0; k < 2; k++) {
          const o = (k ? 1 : -1) * e.gap;
          dm.position.set(e.p.x + e.sx * o, e.y, e.p.z + e.sz * o); dm.scale.set(s + 0.001, s * 0.8 + 0.001, s + 0.001); dm.updateMatrix(); eyeMesh.setMatrixAt(i * 2 + k, dm.matrix);
        }
      }
      eyeMesh.instanceMatrix.needsUpdate = true;
      const heart = 1 + 0.05 * Math.sin(ctx.time * 15), slump = ss(X.sec.pre.t0 + 1.5, X.sec.pre.t0 + 4, t);
      ner.scale.set(heart, (0.85 - 0.2 * slump) * heart, heart); ner.rotation.x = 0.25 * slump;
      const rise = ss(S2.t0, S2.t0 + 3, t), stab = ss(S2.t0 + 4, S2.t0 + 4.4, t) * (1 - ss(S2.t0 + 4.4, S2.t0 + 8, t));
      dag.position.set(sp.x, 0.55 + 1.2 * rise + 0.08 * Math.sin(ctx.time * 1.4), sp.z); dag.rotation.y = ctx.time * 0.6;
      dg.material.opacity = 0.55 + 0.35 * Math.sin(ctx.time * 3) * 0.5 + stab * 0.8;
      ctx.light(0, sp.x, 1.6, sp.z, 0x50c8ff, 0.6 + 1.8 * rise + stab * 5, 26);
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
